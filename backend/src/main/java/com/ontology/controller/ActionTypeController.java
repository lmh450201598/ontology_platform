package com.ontology.controller;

import com.ontology.entity.ActionParameter;
import com.ontology.entity.ActionRule;
import com.ontology.entity.ActionType;
import com.ontology.mapper.ActionParameterMapper;
import com.ontology.mapper.ActionRuleMapper;
import com.ontology.mapper.ActionTypeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/action-types")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ActionTypeController {
    
    private final ActionTypeMapper actionTypeMapper;
    private final ActionParameterMapper actionParameterMapper;
    private final ActionRuleMapper actionRuleMapper;
    
    @PostMapping
    public Map<String, Object> create(@RequestBody Map<String, Object> request) {
        ActionType actionType = new ActionType();
        actionType.setId((String) request.get("id"));
        actionType.setName((String) request.get("name"));
        actionType.setDescription((String) request.get("description"));
        actionType.setTargetObjectId((String) request.get("targetObjectId"));
        actionTypeMapper.insert(actionType);
        
        // Insert parameters
        List<Map<String, Object>> parameters = (List<Map<String, Object>>) request.get("parameters");
        if (parameters != null) {
            for (int i = 0; i < parameters.size(); i++) {
                Map<String, Object> p = parameters.get(i);
                ActionParameter param = new ActionParameter();
                param.setId(actionType.getId() + "_p_" + i);
                param.setActionTypeId(actionType.getId());
                param.setName((String) p.get("name"));
                param.setType((String) p.getOrDefault("type", "string"));
                param.setRequired((Boolean) p.getOrDefault("required", false) ? 1 : 0);
                param.setSortOrder(i);
                actionParameterMapper.insert(param);
            }
        }
        
        // Insert rules
        List<Map<String, Object>> rules = (List<Map<String, Object>>) request.get("rules");
        if (rules != null) {
            for (int i = 0; i < rules.size(); i++) {
                Map<String, Object> r = rules.get(i);
                ActionRule rule = new ActionRule();
                rule.setId(actionType.getId() + "_r_" + i);
                rule.setActionTypeId(actionType.getId());
                rule.setType((String) r.get("type"));
                rule.setDescription((String) r.get("description"));
                actionRuleMapper.insert(rule);
            }
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        return result;
    }
    
    @PutMapping("/{id}")
    public Map<String, Object> update(@PathVariable String id, @RequestBody ActionType actionType) {
        actionType.setId(id);
        actionTypeMapper.updateById(actionType);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        return result;
    }
    
    @DeleteMapping("/{id}")
    public Map<String, Object> delete(@PathVariable String id) {
        actionTypeMapper.deleteById(id);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        return result;
    }
}
