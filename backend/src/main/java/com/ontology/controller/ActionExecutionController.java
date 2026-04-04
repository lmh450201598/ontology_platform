package com.ontology.controller;

import com.ontology.entity.ActionExecution;
import com.ontology.entity.ActionType;
import com.ontology.entity.ActionParameter;
import com.ontology.entity.ActionRule;
import com.ontology.mapper.ActionExecutionMapper;
import com.ontology.mapper.ActionTypeMapper;
import com.ontology.mapper.ActionParameterMapper;
import com.ontology.mapper.ActionRuleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ActionExecutionController {
    
    private final ActionExecutionMapper executionMapper;
    private final ActionTypeMapper actionTypeMapper;
    private final ActionParameterMapper parameterMapper;
    private final ActionRuleMapper ruleMapper;
    
    @PostMapping("/action-types/{actionTypeId}/execute")
    public Map<String, Object> execute(@PathVariable String actionTypeId, @RequestBody Map<String, Object> data) {
        ActionType actionType = actionTypeMapper.selectById(actionTypeId);
        if (actionType == null) {
            throw new RuntimeException("Action type not found");
        }
        
        @SuppressWarnings("unchecked")
        Map<String, Object> parameters = (Map<String, Object>) data.getOrDefault("parameters", new HashMap<>());
        String executedBy = (String) data.getOrDefault("executedBy", "user");
        
        // Get action parameters and rules
        List<ActionParameter> actionParams = parameterMapper.selectByActionTypeId(actionTypeId);
        List<ActionRule> actionRules = ruleMapper.selectByActionTypeId(actionTypeId);
        
        // Validate parameters
        List<String> validationErrors = new ArrayList<>();
        for (ActionParameter param : actionParams) {
            if (param.getRequired() != null && param.getRequired() == 1) {
                if (!parameters.containsKey(param.getName()) || parameters.get(param.getName()) == null) {
                    validationErrors.add("Missing required parameter: " + param.getName());
                }
            }
        }
        
        // Create execution record
        String executionId = "exec_" + UUID.randomUUID().toString().substring(0, 8);
        ActionExecution execution = new ActionExecution();
        execution.setId(executionId);
        execution.setActionTypeId(actionTypeId);
        execution.setTargetObjectId(actionType.getTargetObjectId());
        execution.setParameters(toJson(parameters));
        execution.setExecutedBy(executedBy);
        execution.setCreatedAt(LocalDateTime.now());
        
        if (!validationErrors.isEmpty()) {
            execution.setStatus("failed");
            execution.setValidationErrors(toJson(validationErrors));
            executionMapper.insert(execution);
            
            Map<String, Object> result = new HashMap<>();
            result.put("executionId", executionId);
            result.put("status", "failed");
            result.put("validationErrors", validationErrors);
            return result;
        }
        
        // Execute action logic
        execution.setStatus("completed");
        execution.setCompletedAt(LocalDateTime.now());
        
        // Build result
        Map<String, Object> result = new HashMap<>();
        result.put("executionId", executionId);
        result.put("status", "completed");
        result.put("result", Map.of(
            "actionTypeId", actionTypeId,
            "actionTypeName", actionType.getName(),
            "parameters", parameters,
            "executedAt", execution.getCreatedAt().toString()
        ));
        
        // Process side effects from rules
        List<Map<String, Object>> sideEffects = new ArrayList<>();
        for (ActionRule rule : actionRules) {
            if ("sideEffect".equals(rule.getType())) {
                Map<String, Object> effect = new HashMap<>();
                effect.put("type", "sideEffect");
                effect.put("description", rule.getDescription());
                sideEffects.add(effect);
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
        // Simple JSON serialization - in production use Jackson ObjectMapper
        return obj.toString();
    }
}
