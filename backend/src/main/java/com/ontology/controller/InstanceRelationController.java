package com.ontology.controller;

import com.ontology.entity.ObjectType;
import com.ontology.entity.Property;
import com.ontology.mapper.ObjectTypeMapper;
import com.ontology.mapper.PropertyMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/instances")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InstanceRelationController {

    private final ObjectTypeMapper objectTypeMapper;
    private final PropertyMapper propertyMapper;
    private final JdbcTemplate jdbcTemplate;

    /**
     * 查询实例关系图谱
     * GET /api/instances/{objectTypeId}/{instanceId}/relations
     */
    @GetMapping("/{objectTypeId}/{instanceId}/relations")
    public Map<String, Object> getInstanceRelations(
            @PathVariable String objectTypeId,
            @PathVariable String instanceId,
            @RequestParam(defaultValue = "3") Integer depth) {
        
        // 限制最大深度
        int maxDepth = Math.min(depth, 5);
        
        // 验证对象类型
        ObjectType objectType = objectTypeMapper.selectById(objectTypeId);
        if (objectType == null) {
            return Map.of("success", false, "error", "Object type not found: " + objectTypeId);
        }
        
        // 获取该对象类型的属性
        List<Property> properties = propertyMapper.selectByObjectTypeId(objectTypeId);
        Property pkProperty = properties.stream()
                .filter(p -> p.getIsPrimaryKey() != null && p.getIsPrimaryKey() == 1)
                .findFirst()
                .orElse(properties.isEmpty() ? null : properties.get(0));
        
        if (pkProperty == null || pkProperty.getBaseColumn() == null) {
            return Map.of("success", false, "error", "No primary key property found");
        }
        
        // 验证实例存在
        String tableName = objectType.getBackingDataset();
        String checkSql = String.format("SELECT COUNT(*) FROM `%s` WHERE `%s` = ?", tableName, pkProperty.getBaseColumn());
        Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, instanceId);
        if (count == null || count == 0) {
            return Map.of("success", false, "error", "Instance not found: " + instanceId);
        }
        
        // 构建关系图谱
        List<Map<String, Object>> nodes = new ArrayList<>();
        List<Map<String, Object>> links = new ArrayList<>();
        Set<String> visitedNodes = new HashSet<>();
        Set<String> visitedLinks = new HashSet<>();
        
        // 递归获取关系
        fetchRelations(objectTypeId, instanceId, 0, maxDepth, nodes, links, visitedNodes, visitedLinks);
        
        // 找到中心节点
        String centerNodeKey = objectTypeId + ":" + instanceId;
        Map<String, Object> centerNode = nodes.stream()
                .filter(n -> centerNodeKey.equals(n.get("id")))
                .findFirst()
                .orElse(null);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", Map.of(
                "centerNode", centerNode,
                "nodes", nodes,
                "links", links
        ));
        response.put("totalNodes", nodes.size());
        response.put("totalLinks", links.size());
        
        return response;
    }
    
    private void fetchRelations(String currentObjectTypeId, String currentInstanceId, int currentDepth,
                                 int maxDepth, List<Map<String, Object>> nodes, List<Map<String, Object>> links,
                                 Set<String> visitedNodes, Set<String> visitedLinks) {
        
        if (currentDepth > maxDepth) return;
        
        String nodeKey = currentObjectTypeId + ":" + currentInstanceId;
        if (visitedNodes.contains(nodeKey)) return;
        visitedNodes.add(nodeKey);
        
        // 获取当前对象类型信息
        ObjectType currentOt = objectTypeMapper.selectById(currentObjectTypeId);
        if (currentOt == null) return;
        
        List<Property> currentProps = propertyMapper.selectByObjectTypeId(currentObjectTypeId);
        Property currentPk = currentProps.stream()
                .filter(p -> p.getIsPrimaryKey() != null && p.getIsPrimaryKey() == 1)
                .findFirst()
                .orElse(currentProps.isEmpty() ? null : currentProps.get(0));
        
        if (currentPk == null || currentPk.getBaseColumn() == null) return;
        
        // 获取当前实例数据
        String instanceSql = String.format("SELECT * FROM `%s` WHERE `%s` = ? LIMIT 1", 
                currentOt.getBackingDataset(), currentPk.getBaseColumn());
        Map<String, Object> instanceData;
        try {
            instanceData = jdbcTemplate.queryForMap(instanceSql, currentInstanceId);
        } catch (Exception e) {
            return;
        }
        
        // 添加节点
        Map<String, Object> node = new HashMap<>();
        node.put("id", nodeKey);
        node.put("objectTypeId", currentObjectTypeId);
        node.put("objectTypeName", currentOt.getName());
        node.put("instanceId", currentInstanceId);
        node.put("label", currentInstanceId);
        node.put("data", instanceData);
        node.put("depth", currentDepth);
        nodes.add(node);
        
        // 查询关联的链接类型
        String linkTypeSql = """
            SELECT lt.id, lt.name, lt.source_object_id, lt.target_object_id,
                   lt.source_column, lt.target_column, lt.cardinality,
                   sot.name as source_name, sot.backing_dataset as source_table,
                   tot.name as target_name, tot.backing_dataset as target_table
            FROM link_types lt
            JOIN object_types sot ON lt.source_object_id = sot.id
            JOIN object_types tot ON lt.target_object_id = tot.id
            WHERE lt.source_object_id = ? OR lt.target_object_id = ?
            """;
        
        List<Map<String, Object>> linkTypes = jdbcTemplate.queryForList(linkTypeSql, currentObjectTypeId, currentObjectTypeId);
        
        for (Map<String, Object> linkType : linkTypes) {
            String sourceObjectId = (String) linkType.get("source_object_id");
            String targetObjectId = (String) linkType.get("target_object_id");
            String linkTypeId = (String) linkType.get("id");
            
            boolean isSource = currentObjectTypeId.equals(sourceObjectId);
            String relatedObjectTypeId = isSource ? targetObjectId : sourceObjectId;
            
            // 查询 link_instance_data
            String linkInstanceSql = String.format(
                    "SELECT * FROM link_instance_data WHERE link_type_id = ? AND %s = ?",
                    isSource ? "source_instance_id" : "target_instance_id"
            );
            
            List<Map<String, Object>> linkInstances = jdbcTemplate.queryForList(linkInstanceSql, linkTypeId, currentInstanceId);
            
            for (Map<String, Object> linkInstance : linkInstances) {
                String relatedInstanceId = isSource ? 
                        (String) linkInstance.get("target_instance_id") : 
                        (String) linkInstance.get("source_instance_id");
                String relatedNodeKey = relatedObjectTypeId + ":" + relatedInstanceId;
                
                // 添加链接
                String linkKey = nodeKey + ":" + relatedNodeKey + ":" + linkTypeId;
                if (!visitedLinks.contains(linkKey)) {
                    visitedLinks.add(linkKey);
                    
                    Map<String, Object> link = new HashMap<>();
                    link.put("id", linkKey);
                    link.put("source", nodeKey);
                    link.put("target", relatedNodeKey);
                    link.put("linkTypeId", linkTypeId);
                    link.put("linkTypeName", linkType.get("name"));
                    link.put("cardinality", linkType.get("cardinality"));
                    link.put("direction", isSource ? "downstream" : "upstream");
                    links.add(link);
                }
                
                // 递归查询
                if (!visitedNodes.contains(relatedNodeKey)) {
                    fetchRelations(relatedObjectTypeId, relatedInstanceId, currentDepth + 1, maxDepth,
                            nodes, links, visitedNodes, visitedLinks);
                }
            }
        }
    }
}
