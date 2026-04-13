package com.ontology.controller;

import com.ontology.entity.*;
import com.ontology.mapper.*;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ActionExecutionController {
    
    private final ActionExecutionMapper executionMapper;
    private final ActionTypeMapper actionTypeMapper;
    private final ActionRuleMapper ruleMapper;
    private final ActionRuleParamMapper ruleParamMapper;
    private final ActionEffectMapper effectMapper;
    private final NotificationMapper notificationMapper;
    private final OntologyRuleMapper ontologyRuleMapper;
    private final FunctionTypeMapper functionTypeMapper;
    private final ObjectTypeMapper objectTypeMapper;
    private final PropertyMapper propertyMapper;
    private final JdbcTemplate jdbcTemplate;
    private final RestTemplate restTemplate = new RestTemplate();
    
    @PostMapping("/action-types/{actionTypeId}/execute")
    @Transactional
    public Map<String, Object> execute(@PathVariable String actionTypeId, @RequestBody Map<String, Object> data) {
        ActionType actionType = actionTypeMapper.selectById(actionTypeId);
        if (actionType == null) {
            throw new RuntimeException("Action type not found");
        }
        
        @SuppressWarnings("unchecked")
        Map<String, Object> parameters = (Map<String, Object>) data.getOrDefault("parameters", new HashMap<>());
        String executedBy = (String) data.getOrDefault("executedBy", "user");
        String instanceId = (String) data.get("instanceId");
        
        // Get action rules and effects
        List<ActionRule> actionRules = ruleMapper.selectByActionTypeId(actionTypeId);
        // 加载每个规则的参数
        for (ActionRule rule : actionRules) {
            List<ActionRuleParam> params = ruleParamMapper.selectByActionRuleId(rule.getId());
            rule.setParams(params);
        }
        List<ActionEffect> actionEffects = effectMapper.selectByActionTypeId(actionTypeId);
        
        // Create execution record
        String executionId = "exec_" + UUID.randomUUID().toString().substring(0, 8);
        ActionExecution execution = new ActionExecution();
        execution.setId(executionId);
        execution.setActionTypeId(actionTypeId);
        execution.setTargetObjectId(instanceId);
        execution.setParameters(toJson(parameters));
        execution.setExecutedBy(executedBy);
        execution.setCreatedAt(LocalDateTime.now());
        
        // Execute action logic - process rules
        List<Map<String, Object>> executedRules = new ArrayList<>();
        boolean allSuccess = true;
        
        for (ActionRule rule : actionRules) {
            Map<String, Object> ruleResult = executeRule(rule, parameters, instanceId);
            executedRules.add(ruleResult);
            if (!"success".equals(ruleResult.get("status"))) {
                allSuccess = false;
            }
        }
        
        execution.setStatus(allSuccess ? "completed" : "failed");
        execution.setCompletedAt(LocalDateTime.now());
        
        // Build result
        Map<String, Object> result = new HashMap<>();
        result.put("executionId", executionId);
        result.put("status", allSuccess ? "completed" : "failed");
        result.put("result", Map.of(
            "actionTypeId", actionTypeId,
            "actionTypeName", actionType.getDisplayName(),
            "parameters", parameters,
            "executedAt", execution.getCreatedAt().toString(),
            "rules", executedRules
        ));
        
        // Process side effects only if all rules succeeded
        List<Map<String, Object>> sideEffects = new ArrayList<>();
        if (allSuccess) {
            for (ActionEffect effect : actionEffects) {
                if (effect.getIsEnabled() != null && effect.getIsEnabled() == 1) {
                    Map<String, Object> effectResult = executeEffect(effect, actionType, instanceId);
                    sideEffects.add(effectResult);
                }
            }
        }
        
        if (!sideEffects.isEmpty()) {
            result.put("sideEffects", sideEffects);
            execution.setSideEffects(toJson(sideEffects));
        }
        
        execution.setResult(toJson(result.get("result")));
        executionMapper.insert(execution);
        
        return result;
    }
    
    /**
     * 函数类型执行预览
     * POST /api/function-types/{functionTypeId}/execute
     */
    @PostMapping("/function-types/{functionTypeId}/execute")
    public Map<String, Object> executeFunctionTypePreview(
            @PathVariable String functionTypeId,
            @RequestBody Map<String, Object> parameters) {
        
        FunctionType functionType = functionTypeMapper.selectById(functionTypeId);
        if (functionType == null) {
            throw new RuntimeException("Function type not found: " + functionTypeId);
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("functionTypeId", functionTypeId);
        result.put("functionName", functionType.getName());
        result.put("functionCode", functionType.getCode());
        result.put("parameters", parameters);
        
        // 执行函数类型
        Map<String, Object> execResult = executeFunctionType(functionType, parameters, null);
        result.put("status", execResult.get("status"));
        
        if ("success".equals(execResult.get("status"))) {
            result.put("response", execResult.get("response"));
        } else {
            result.put("error", execResult.get("error"));
        }
        
        return result;
    }
    
    private Map<String, Object> executeRule(ActionRule rule, Map<String, Object> parameters, String instanceId) {
        Map<String, Object> result = new HashMap<>();
        result.put("ruleId", rule.getId());
        result.put("ruleType", rule.getRuleType());
        
        if ("ONTOLOGY".equals(rule.getRuleType())) {
            result.put("ontologyRuleId", rule.getOntologyRuleId());
            
            // 查询本体规则配置
            OntologyRule ontologyRule = ontologyRuleMapper.selectById(rule.getOntologyRuleId());
            if (ontologyRule == null) {
                result.put("status", "failed");
                result.put("error", "Ontology rule not found");
                return result;
            }
            
            // 执行本体规则
            Map<String, Object> execResult = executeOntologyRule(ontologyRule, parameters, rule.getParams());
            result.putAll(execResult);
            
        } else if ("OTHER".equals(rule.getRuleType())) {
            result.put("functionTypeId", rule.getFunctionTypeId());
            
            // 查询函数类型配置
            FunctionType functionType = functionTypeMapper.selectById(rule.getFunctionTypeId());
            if (functionType == null) {
                result.put("status", "failed");
                result.put("error", "Function type not found");
                return result;
            }
            
            // 执行函数类型
            Map<String, Object> execResult = executeFunctionType(functionType, parameters, rule.getParams());
            result.putAll(execResult);
        }
        
        return result;
    }
    
    private Map<String, Object> executeOntologyRule(OntologyRule rule, Map<String, Object> parameters, List<ActionRuleParam> ruleParams) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 从 interfaceUrl 中提取对象类型ID
            // URL格式: /api/instances/{objectTypeId}
            String url = rule.getInterfaceUrl();
            String objectTypeId = url.substring(url.lastIndexOf("/") + 1);
            
            // 查询对象类型
            ObjectType objectType = objectTypeMapper.selectById(objectTypeId);
            if (objectType == null) {
                result.put("status", "failed");
                result.put("error", "Object type not found: " + objectTypeId);
                return result;
            }
            
            String tableName = objectType.getBackingDataset();
            List<Property> properties = propertyMapper.selectByObjectTypeId(objectTypeId);
            
            // 构建属性映射: baseColumn -> propertyId
            Map<String, String> columnToPropId = new HashMap<>();
            for (Property prop : properties) {
                if (prop.getBaseColumn() != null && !prop.getBaseColumn().isEmpty()) {
                    columnToPropId.put(prop.getBaseColumn(), prop.getId());
                }
            }
            
            // 构建插入数据
            Map<String, Object> insertData = new HashMap<>();
            
            // 处理规则参数
            if (ruleParams != null) {
                for (ActionRuleParam param : ruleParams) {
                    String paramName = param.getParamName();
                    if (paramName != null && !paramName.isEmpty()) {
                        // 从执行参数中获取值（支持paramName和baseColumn两种key）
                        Object value = null;
                        
                        // 首先尝试用paramName查找
                        if (parameters.containsKey(paramName)) {
                            value = parameters.get(paramName);
                        }
                        
                        // 如果没找到，尝试用baseColumn查找（如果不同）
                        if (value == null && columnToPropId.containsKey(paramName)) {
                            // paramName就是baseColumn，已经尝试过了
                        }
                        
                        // 如果还是没找到，使用默认值
                        if (value == null) {
                            value = param.getParamValue();
                        }
                        
                        if (value != null) {
                            // 查找对应的属性ID
                            String propId = columnToPropId.get(paramName);
                            if (propId != null) {
                                insertData.put(propId, value.toString());
                            } else {
                                // 如果找不到映射，直接使用参数名
                                insertData.put(paramName, value.toString());
                            }
                        }
                    }
                }
            }
            
            // 根据规则类别执行不同操作
            if ("CREATE_OBJECT".equals(rule.getRuleCategory())) {
                // 创建实例
                List<String> columns = new ArrayList<>();
                List<String> placeholders = new ArrayList<>();
                List<Object> values = new ArrayList<>();
                
                for (Property prop : properties) {
                    if (prop.getBaseColumn() != null && !prop.getBaseColumn().isEmpty()) {
                        Object value = insertData.get(prop.getId());
                        if (value != null) {
                            columns.add("`" + prop.getBaseColumn() + "`");
                            placeholders.add("?");
                            values.add(value);
                        }
                    }
                }
                
                // 添加时间戳
                columns.add("`created_at`");
                placeholders.add("?");
                values.add(LocalDateTime.now());
                columns.add("`updated_at`");
                placeholders.add("?");
                values.add(LocalDateTime.now());
                
                String sql = String.format("INSERT INTO `%s` (%s) VALUES (%s)", 
                        tableName, 
                        String.join(", ", columns), 
                        String.join(", ", placeholders));
                
                jdbcTemplate.update(sql, values.toArray());
                
                result.put("status", "success");
                result.put("message", "Instance created successfully");
                
            } else if ("UPDATE_OBJECT".equals(rule.getRuleCategory())) {
                // TODO: 实现更新逻辑
                result.put("status", "success");
                result.put("message", "Update not fully implemented");
            } else if ("DELETE_OBJECT".equals(rule.getRuleCategory())) {
                // TODO: 实现删除逻辑
                result.put("status", "success");
                result.put("message", "Delete not fully implemented");
            } else {
                result.put("status", "success");
                result.put("message", "Rule category not supported: " + rule.getRuleCategory());
            }
            
        } catch (Exception e) {
            result.put("status", "failed");
            result.put("error", e.getMessage());
        }
        
        return result;
    }
    
    private Map<String, Object> executeFunctionType(FunctionType functionType, Map<String, Object> parameters, List<ActionRuleParam> ruleParams) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 构建请求参数
            Map<String, Object> requestBody = new HashMap<>();
            
            // 如果有规则参数，按规则参数构建请求体
            if (ruleParams != null && !ruleParams.isEmpty()) {
                for (ActionRuleParam param : ruleParams) {
                    if (param.getParamName() != null && !param.getParamName().isEmpty()) {
                        Object value = parameters.get(param.getParamName());
                        if (value == null) {
                            value = param.getParamValue();
                        }
                        requestBody.put(param.getParamName(), value);
                    }
                }
            } else {
                // 没有规则参数时，直接使用传入的参数
                requestBody.putAll(parameters);
            }
            
            // 调用函数类型接口
            String url = "http://localhost:8080" + functionType.getInterfaceUrl();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map> response;
            String method = functionType.getRequestMethod() != null ? functionType.getRequestMethod().toUpperCase() : "POST";
            
            switch (method) {
                case "GET":
                    response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
                    break;
                case "PUT":
                    response = restTemplate.exchange(url, HttpMethod.PUT, entity, Map.class);
                    break;
                case "DELETE":
                    response = restTemplate.exchange(url, HttpMethod.DELETE, entity, Map.class);
                    break;
                default:
                    response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
            }
            
            if (response.getStatusCode().is2xxSuccessful()) {
                result.put("status", "success");
                result.put("response", response.getBody());
            } else {
                result.put("status", "failed");
                result.put("error", "HTTP " + response.getStatusCode());
            }
            
        } catch (Exception e) {
            result.put("status", "failed");
            result.put("error", e.getMessage());
        }
        
        return result;
    }
    
    private Map<String, Object> executeEffect(ActionEffect effect, ActionType actionType, String instanceId) {
        Map<String, Object> result = new HashMap<>();
        result.put("effectType", effect.getEffectType());
        result.put("status", "executed");
        
        if ("NOTIFICATION".equals(effect.getEffectType())) {
            // 创建站内通知
            Notification notification = new Notification();
            notification.setId("notif_" + System.currentTimeMillis());
            notification.setTitle("动作类型执行成功");
            notification.setContent(effect.getContent() != null ? effect.getContent() : "完成" + instanceId + "的操作");
            notification.setType("EXECUTION");
            notification.setStatus("UNREAD");
            notification.setRelatedObjectType("action_type");
            notification.setRelatedObjectId(actionType.getId());
            notification.setCreatedAt(LocalDateTime.now());
            notificationMapper.insert(notification);
            
            result.put("notificationId", notification.getId());
        } else if ("LINGKE".equals(effect.getEffectType())) {
            result.put("status", "not_implemented");
            result.put("message", "铃客消息推送暂未实现");
        } else if ("EMAIL".equals(effect.getEffectType())) {
            result.put("status", "not_implemented");
            result.put("message", "邮件推送暂未实现");
        }
        
        return result;
    }
    
    @GetMapping("/action-types/{actionTypeId}/executions")
    public Map<String, Object> getExecutions(@PathVariable String actionTypeId) {
        List<ActionExecution> executions = executionMapper.selectByActionTypeId(actionTypeId);
        return Map.of("executions", executions);
    }
    
    @GetMapping("/action-executions")
    public Map<String, Object> getAllExecutions() {
        List<ActionExecution> executions = executionMapper.selectAllOrdered();
        return Map.of("executions", executions);
    }
    
    private String toJson(Object obj) {
        if (obj == null) {
            return null;
        }
        return obj.toString();
    }
}
