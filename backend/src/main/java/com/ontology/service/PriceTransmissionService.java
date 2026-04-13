package com.ontology.service;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class PriceTransmissionService {
    
    private final JdbcTemplate jdbcTemplate;
    
    public Map<String, Object> calculatePriceTransmission(String instanceId, Double latestPrice, Integer depth) {
        try {
            // 1. 查询源实例（碳酸锂）信息
            Map<String, Object> sourceInstance = querySourceInstance(instanceId);
            if (sourceInstance == null) {
                return Map.of("success", false, "error", "Instance not found: " + instanceId);
            }
            
            Double previousPrice = ((Number) sourceInstance.get("price")).doubleValue();
            String instanceName = (String) sourceInstance.get("name");
            
            // 2. 计算价格变化百分比和传导系数
            double priceChangePercent = ((latestPrice - previousPrice) / previousPrice) * 100;
            double transmissionCoefficient = priceChangePercent * 0.9;
            
            // 3. 递归查询关系图谱
            Map<String, Object> relationGraph = queryRelationGraph("lithium_carbonate", instanceId, depth);
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> nodes = (List<Map<String, Object>>) relationGraph.get("nodes");
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> links = (List<Map<String, Object>>) relationGraph.get("links");
            
            // 4. 计算各关联实例的新价格
            List<Map<String, Object>> affectedInstances = new ArrayList<>();
            double totalPriceChangeAmount = 0;
            
            // 构建节点深度映射
            Map<String, Integer> nodeDepthMap = new HashMap<>();
            for (Map<String, Object> node : nodes) {
                String nodeId = (String) node.get("id");
                Integer nodeDepth = (Integer) node.get("depth");
                nodeDepthMap.put(nodeId, nodeDepth);
            }
            
            // 排除源实例，计算其他实例
            String sourceNodeId = "lithium_carbonate:" + instanceId;
            for (Map<String, Object> node : nodes) {
                String nodeId = (String) node.get("id");
                if (nodeId.equals(sourceNodeId)) continue;
                
                String objectTypeId = (String) node.get("objectTypeId");
                String instanceIdInNode = (String) node.get("instanceId");
                String objectTypeName = (String) node.get("objectTypeName");
                String label = (String) node.get("label");
                Integer nodeDepth = nodeDepthMap.getOrDefault(nodeId, 1);
                
                // 查询该实例当前价格
                Double instancePreviousPrice = queryInstancePrice(objectTypeId, instanceIdInNode);
                if (instancePreviousPrice == null) continue;
                
                // 计算衰减后的传导系数（每层衰减20%）
                double depthDecay = Math.pow(0.8, nodeDepth);
                double instanceCoefficient = transmissionCoefficient * depthDecay;
                
                // 计算新价格
                double instanceLatestPrice = instancePreviousPrice * (1 + instanceCoefficient / 100);
                double priceChangeAmount = instanceLatestPrice - instancePreviousPrice;
                
                // 构建关系路径
                String relationPath = buildRelationPath(sourceNodeId, nodeId, links, nodeDepthMap);
                
                Map<String, Object> affectedInstance = new LinkedHashMap<>();
                affectedInstance.put("id", instanceIdInNode);
                affectedInstance.put("objectTypeId", objectTypeId);
                affectedInstance.put("objectTypeName", objectTypeName);
                affectedInstance.put("name", label);
                affectedInstance.put("relationPath", relationPath);
                affectedInstance.put("relationDepth", nodeDepth);
                affectedInstance.put("previousPrice", round(instancePreviousPrice, 2));
                affectedInstance.put("transmissionCoefficient", round(instanceCoefficient, 2));
                affectedInstance.put("latestPrice", round(instanceLatestPrice, 2));
                affectedInstance.put("priceChangeAmount", round(priceChangeAmount, 2));
                
                affectedInstances.add(affectedInstance);
                totalPriceChangeAmount += priceChangeAmount;
            }
            
            // 5. 组装返回结果
            Map<String, Object> sourceResult = new LinkedHashMap<>();
            sourceResult.put("id", instanceId);
            sourceResult.put("name", instanceName);
            sourceResult.put("previousPrice", round(previousPrice, 2));
            sourceResult.put("latestPrice", round(latestPrice, 2));
            sourceResult.put("priceChangePercent", round(priceChangePercent, 2));
            
            Map<String, Object> summary = new LinkedHashMap<>();
            summary.put("totalAffectedInstances", affectedInstances.size());
            summary.put("totalPriceChangeAmount", round(totalPriceChangeAmount, 2));
            
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("sourceInstance", sourceResult);
            data.put("transmissionCoefficient", round(transmissionCoefficient, 2));
            data.put("affectedInstances", affectedInstances);
            data.put("summary", summary);
            
            return Map.of("success", true, "data", data);
            
        } catch (Exception e) {
            return Map.of("success", false, "error", e.getMessage());
        }
    }
    
    private Map<String, Object> querySourceInstance(String instanceId) {
        String sql = "SELECT * FROM lithium_carbonate WHERE unique_id = ?";
        List<Map<String, Object>> results = jdbcTemplate.queryForList(sql, instanceId);
        if (results.isEmpty()) return null;
        return results.get(0);
    }
    
    private Double queryInstancePrice(String objectTypeId, String instanceId) {
        try {
            String sql = "SELECT price FROM " + objectTypeId + " WHERE unique_id = ?";
            List<Map<String, Object>> results = jdbcTemplate.queryForList(sql, instanceId);
            if (results.isEmpty()) return null;
            Object priceObj = results.get(0).get("price");
            if (priceObj == null) return null;
            return ((Number) priceObj).doubleValue();
        } catch (Exception e) {
            return null;
        }
    }
    
    private Map<String, Object> queryRelationGraph(String objectTypeId, String instanceId, int depth) {
        // 使用递归查询获取关系图谱
        Set<String> visitedNodes = new HashSet<>();
        Set<String> visitedLinks = new HashSet<>();
        List<Map<String, Object>> nodes = new ArrayList<>();
        List<Map<String, Object>> links = new ArrayList<>();
        
        // 添加源节点
        Map<String, Object> sourceNode = buildNode(objectTypeId, instanceId, 0);
        if (sourceNode != null) {
            nodes.add(sourceNode);
            visitedNodes.add(objectTypeId + ":" + instanceId);
        }
        
        // BFS递归查询
        Queue<Map<String, Object>> queue = new LinkedList<>();
        queue.offer(Map.of("objectTypeId", objectTypeId, "instanceId", instanceId, "depth", 0));
        
        while (!queue.isEmpty()) {
            Map<String, Object> current = queue.poll();
            String currentObjectType = (String) current.get("objectTypeId");
            String currentInstanceId = (String) current.get("instanceId");
            int currentDepth = (Integer) current.get("depth");
            
            if (currentDepth >= depth) continue;
            
            // 查询下游关系
            queryAndAddRelations(currentObjectType, currentInstanceId, currentDepth, 
                "source_object_type", "source_object_id", "downstream",
                visitedNodes, visitedLinks, nodes, links, queue);
            
            // 查询上游关系
            queryAndAddRelations(currentObjectType, currentInstanceId, currentDepth,
                "target_object_type", "target_object_id", "upstream",
                visitedNodes, visitedLinks, nodes, links, queue);
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("nodes", nodes);
        result.put("links", links);
        return result;
    }
    
    private void queryAndAddRelations(String objectTypeId, String instanceId, int currentDepth,
                                      String queryField, String queryIdField, String direction,
                                      Set<String> visitedNodes, Set<String> visitedLinks,
                                      List<Map<String, Object>> nodes, List<Map<String, Object>> links,
                                      Queue<Map<String, Object>> queue) {
        // link_instance_data 表结构：id, link_type_id, source_instance_id, target_instance_id
        String sql;
        List<Map<String, Object>> relations;
        
        if ("downstream".equals(direction)) {
            // 查询下游：当前实例作为source
            sql = "SELECT * FROM link_instance_data WHERE source_instance_id = ?";
            relations = jdbcTemplate.queryForList(sql, instanceId);
        } else {
            // 查询上游：当前实例作为target
            sql = "SELECT * FROM link_instance_data WHERE target_instance_id = ?";
            relations = jdbcTemplate.queryForList(sql, instanceId);
        }
        
        for (Map<String, Object> relation : relations) {
            String linkTypeId = (String) relation.get("link_type_id");
            String linkTypeName = queryLinkTypeName(linkTypeId);
            
            String targetInstanceId;
            if ("downstream".equals(direction)) {
                targetInstanceId = (String) relation.get("target_instance_id");
            } else {
                targetInstanceId = (String) relation.get("source_instance_id");
            }
            
            // 从实例ID解析对象类型
            String targetObjectType = inferObjectTypeFromInstanceId(targetInstanceId);
            if (targetObjectType == null) continue;
            
            String targetNodeId = targetObjectType + ":" + targetInstanceId;
            Long linkId = ((Number) relation.get("id")).longValue();
            String linkIdStr = String.valueOf(linkId);
            
            // 添加目标节点
            if (!visitedNodes.contains(targetNodeId)) {
                Map<String, Object> targetNode = buildNode(targetObjectType, targetInstanceId, currentDepth + 1);
                if (targetNode != null) {
                    nodes.add(targetNode);
                    visitedNodes.add(targetNodeId);
                    queue.offer(Map.of("objectTypeId", targetObjectType, "instanceId", targetInstanceId, "depth", currentDepth + 1));
                }
            }
            
            // 添加链接
            if (!visitedLinks.contains(linkIdStr)) {
                Map<String, Object> link = new LinkedHashMap<>();
                link.put("id", linkIdStr);
                link.put("source", "downstream".equals(direction) ? (objectTypeId + ":" + instanceId) : targetNodeId);
                link.put("target", "downstream".equals(direction) ? targetNodeId : (objectTypeId + ":" + instanceId));
                link.put("linkTypeId", linkTypeId);
                link.put("linkTypeName", linkTypeName);
                link.put("direction", direction);
                links.add(link);
                visitedLinks.add(linkIdStr);
            }
        }
    }
    
    private String inferObjectTypeFromInstanceId(String instanceId) {
        // 根据实例ID前缀推断对象类型
        if (instanceId.startsWith("LC-")) return "lithium_carbonate";
        if (instanceId.startsWith("CM-")) return "cathode_material";
        if (instanceId.startsWith("BC-")) return "battery_cell";
        if (instanceId.startsWith("BM-")) return "battery_module";
        if (instanceId.startsWith("BP-")) return "battery_pack";
        if (instanceId.startsWith("NEV-")) return "new_energy_vehicle";
        if (instanceId.startsWith("EL-")) return "battery_electrolyte";
        if (instanceId.startsWith("AN-")) return "battery_anode";
        if (instanceId.startsWith("SEP-")) return "battery_separator";
        // 默认返回null，表示无法识别
        return null;
    }
    
    private Map<String, Object> buildNode(String objectTypeId, String instanceId, int depth) {
        try {
            // 查询对象类型名称
            String objectTypeSql = "SELECT name FROM object_types WHERE id = ?";
            List<Map<String, Object>> objectTypeResults = jdbcTemplate.queryForList(objectTypeSql, objectTypeId);
            String objectTypeName = objectTypeResults.isEmpty() ? objectTypeId : (String) objectTypeResults.get(0).get("name");
            
            // 查询实例数据
            String instanceSql = "SELECT * FROM " + objectTypeId + " WHERE unique_id = ?";
            List<Map<String, Object>> instanceResults = jdbcTemplate.queryForList(instanceSql, instanceId);
            if (instanceResults.isEmpty()) return null;
            
            Map<String, Object> instanceData = instanceResults.get(0);
            String name = instanceData.get("grade") != null ? (String) instanceData.get("grade") : instanceId;
            
            Map<String, Object> node = new LinkedHashMap<>();
            node.put("id", objectTypeId + ":" + instanceId);
            node.put("objectTypeId", objectTypeId);
            node.put("objectTypeName", objectTypeName);
            node.put("instanceId", instanceId);
            node.put("label", instanceId);
            node.put("data", instanceData);
            node.put("depth", depth);
            
            return node;
        } catch (Exception e) {
            return null;
        }
    }
    
    private String queryLinkTypeName(String linkTypeId) {
        try {
            String sql = "SELECT name FROM link_types WHERE id = ?";
            List<Map<String, Object>> results = jdbcTemplate.queryForList(sql, linkTypeId);
            return results.isEmpty() ? linkTypeId : (String) results.get(0).get("name");
        } catch (Exception e) {
            return linkTypeId;
        }
    }
    
    private String buildRelationPath(String sourceNodeId, String targetNodeId, 
                                     List<Map<String, Object>> links, 
                                     Map<String, Integer> nodeDepthMap) {
        // 简化的路径构建，实际应该使用BFS找到最短路径
        StringBuilder path = new StringBuilder();
        String[] sourceParts = sourceNodeId.split(":");
        String[] targetParts = targetNodeId.split(":");
        
        path.append(sourceParts[1]).append(" → ");
        
        Integer targetDepth = nodeDepthMap.get(targetNodeId);
        if (targetDepth != null && targetDepth > 1) {
            path.append("... → ");
        }
        
        path.append(targetParts[1]);
        return path.toString();
    }
    
    private double round(double value, int places) {
        double factor = Math.pow(10, places);
        return Math.round(value * factor) / factor;
    }
}
