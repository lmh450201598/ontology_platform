package com.ontology.controller;

import com.ontology.entity.*;
import com.ontology.mapper.*;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/action-types")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ActionTypeController {
    
    private final ActionTypeMapper actionTypeMapper;
    private final ActionRuleMapper actionRuleMapper;
    private final ActionRuleParamMapper actionRuleParamMapper;
    private final ActionEffectMapper actionEffectMapper;
    private final OntologyRuleMapper ontologyRuleMapper;
    private final FunctionTypeMapper functionTypeMapper;
    
    @GetMapping
    public Map<String, Object> list() {
        List<ActionType> list = actionTypeMapper.selectAllActive();
        
        // 加载规则和副作用
        for (ActionType at : list) {
            loadRulesAndEffects(at);
        }
        
        return Map.of("success", true, "actionTypes", list);
    }
    
    @GetMapping("/{id}")
    public Map<String, Object> getById(@PathVariable String id) {
        ActionType at = actionTypeMapper.selectById(id);
        if (at == null) {
            return Map.of("success", false, "error", "Action type not found");
        }
        loadRulesAndEffects(at);
        return Map.of("success", true, "actionType", at);
    }
    
    @PostMapping
    @Transactional
    public Map<String, Object> create(@RequestBody Map<String, Object> data) {
        String displayName = (String) data.get("displayName");
        if (displayName == null || displayName.isEmpty()) {
            return Map.of("success", false, "error", "Display name is required");
        }
        
        ActionType at = new ActionType();
        at.setId("act_" + System.currentTimeMillis());
        at.setDisplayName(displayName);
        at.setDescription((String) data.get("description"));
        at.setStatus("ACTIVE");
        at.setCreatedAt(LocalDateTime.now());
        at.setUpdatedAt(LocalDateTime.now());
        
        actionTypeMapper.insert(at);
        
        // 保存规则
        saveRules(at.getId(), data);
        
        // 保存副作用
        saveEffects(at.getId(), data);
        
        return Map.of("success", true, "actionType", at);
    }
    
    @PutMapping("/{id}")
    @Transactional
    public Map<String, Object> update(@PathVariable String id, @RequestBody Map<String, Object> data) {
        ActionType at = actionTypeMapper.selectById(id);
        if (at == null) {
            return Map.of("success", false, "error", "Action type not found");
        }
        
        if (data.containsKey("displayName")) at.setDisplayName((String) data.get("displayName"));
        if (data.containsKey("description")) at.setDescription((String) data.get("description"));
        if (data.containsKey("status")) at.setStatus((String) data.get("status"));
        at.setUpdatedAt(LocalDateTime.now());
        
        actionTypeMapper.updateById(at);
        
        // 更新规则
        if (data.containsKey("rules")) {
            actionRuleParamMapper.deleteByActionTypeId(id);
            actionRuleMapper.deleteByActionTypeId(id);
            saveRules(id, data);
        }
        
        // 更新副作用
        if (data.containsKey("effects")) {
            actionEffectMapper.deleteByActionTypeId(id);
            saveEffects(id, data);
        }
        
        return Map.of("success", true, "actionType", at);
    }
    
    @DeleteMapping("/{id}")
    @Transactional
    public Map<String, Object> delete(@PathVariable String id) {
        // 软删除
        ActionType at = new ActionType();
        at.setId(id);
        at.setStatus("DISABLED");
        at.setUpdatedAt(LocalDateTime.now());
        actionTypeMapper.updateById(at);
        
        return Map.of("success", true);
    }
    
    private void loadRulesAndEffects(ActionType at) {
        // 加载规则
        List<ActionRule> rules = actionRuleMapper.selectByActionTypeId(at.getId());
        for (ActionRule rule : rules) {
            // 加载参数
            List<ActionRuleParam> params = actionRuleParamMapper.selectByActionRuleId(rule.getId());
            rule.setParams(params);
            
            // 加载关联信息
            if ("ONTOLOGY".equals(rule.getRuleType()) && rule.getOntologyRuleId() != null) {
                OntologyRule or = ontologyRuleMapper.selectById(rule.getOntologyRuleId());
                if (or != null) {
                    rule.setOntologyRuleName(or.getFunctionName());
                    rule.setOntologyRuleDescription(or.getFunctionDescription());
                }
            } else if ("OTHER".equals(rule.getRuleType()) && rule.getFunctionTypeId() != null) {
                FunctionType ft = functionTypeMapper.selectById(rule.getFunctionTypeId());
                if (ft != null) {
                    rule.setFunctionTypeName(ft.getName());
                    rule.setFunctionTypeCode(ft.getCode());
                }
            }
        }
        at.setRules(rules);
        
        // 加载副作用
        List<ActionEffect> effects = actionEffectMapper.selectByActionTypeId(at.getId());
        at.setEffects(effects);
    }
    
    @SuppressWarnings("unchecked")
    private void saveRules(String actionTypeId, Map<String, Object> data) {
        List<Map<String, Object>> rules = (List<Map<String, Object>>) data.get("rules");
        if (rules == null) return;
        
        int sortOrder = 0;
        for (Map<String, Object> ruleData : rules) {
            ActionRule rule = new ActionRule();
            rule.setId("ar_" + System.currentTimeMillis() + "_" + sortOrder);
            rule.setActionTypeId(actionTypeId);
            rule.setRuleType((String) ruleData.get("ruleType"));
            rule.setOntologyRuleCategory((String) ruleData.get("ontologyRuleCategory"));
            rule.setOntologyRuleId((String) ruleData.get("ontologyRuleId"));
            rule.setFunctionTypeId((String) ruleData.get("functionTypeId"));
            rule.setSortOrder(sortOrder++);
            rule.setCreatedAt(LocalDateTime.now());
            
            actionRuleMapper.insert(rule);
            
            // 保存参数
            List<Map<String, Object>> params = (List<Map<String, Object>>) ruleData.get("params");
            if (params != null) {
                int paramSort = 0;
                for (Map<String, Object> paramData : params) {
                    ActionRuleParam param = new ActionRuleParam();
                    param.setId("arp_" + System.currentTimeMillis() + "_" + paramSort);
                    param.setActionRuleId(rule.getId());
                    param.setParamName((String) paramData.get("paramName"));
                    param.setParamValue((String) paramData.get("paramValue"));
                    param.setSortOrder(paramSort++);
                    actionRuleParamMapper.insert(param);
                }
            }
        }
    }
    
    @SuppressWarnings("unchecked")
    private void saveEffects(String actionTypeId, Map<String, Object> data) {
        List<Map<String, Object>> effects = (List<Map<String, Object>>) data.get("effects");
        if (effects == null) return;
        
        int sortOrder = 0;
        for (Map<String, Object> effectData : effects) {
            ActionEffect effect = new ActionEffect();
            effect.setId("ae_" + System.currentTimeMillis() + "_" + sortOrder);
            effect.setActionTypeId(actionTypeId);
            effect.setEffectType((String) effectData.get("effectType"));
            effect.setContent((String) effectData.get("content"));
            // 处理isEnabled：可能是Boolean或Integer
            Object isEnabledObj = effectData.get("isEnabled");
            int isEnabled = 1;
            if (isEnabledObj instanceof Boolean) {
                isEnabled = (Boolean) isEnabledObj ? 1 : 0;
            } else if (isEnabledObj instanceof Integer) {
                isEnabled = (Integer) isEnabledObj;
            } else if (isEnabledObj instanceof Number) {
                isEnabled = ((Number) isEnabledObj).intValue();
            }
            effect.setIsEnabled(isEnabled);
            effect.setSortOrder(sortOrder++);
            actionEffectMapper.insert(effect);
        }
    }
}
