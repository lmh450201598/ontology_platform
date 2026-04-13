package com.ontology.controller;

import com.ontology.entity.OntologyRule;
import com.ontology.entity.OntologyRuleParam;
import com.ontology.mapper.OntologyRuleMapper;
import com.ontology.mapper.OntologyRuleParamMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/ontology-rules")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OntologyRuleController {

    private final OntologyRuleMapper ruleMapper;
    private final OntologyRuleParamMapper paramMapper;

    @GetMapping
    public Map<String, Object> list(@RequestParam(required = false) String category) {
        List<OntologyRule> rules;
        if (category != null && !category.isEmpty()) {
            rules = ruleMapper.selectByCategory(category);
        } else {
            rules = ruleMapper.selectAllOrdered();
        }
        
        // 加载每个规则的参数
        for (OntologyRule rule : rules) {
            rule.setInputParams(paramMapper.selectInputParamsByRuleId(rule.getId()));
            rule.setOutputParams(paramMapper.selectOutputParamsByRuleId(rule.getId()));
        }
        
        return Map.of("rules", rules);
    }

    @GetMapping("/{id}")
    public Map<String, Object> getById(@PathVariable String id) {
        OntologyRule rule = ruleMapper.selectById(id);
        if (rule == null) {
            throw new RuntimeException("Rule not found");
        }
        rule.setInputParams(paramMapper.selectInputParamsByRuleId(id));
        rule.setOutputParams(paramMapper.selectOutputParamsByRuleId(id));
        return Map.of("rule", rule);
    }

    @PostMapping
    public Map<String, Object> create(@RequestBody Map<String, Object> request) {
        String id = "rule_" + UUID.randomUUID().toString().substring(0, 8);
        
        OntologyRule rule = new OntologyRule();
        rule.setId(id);
        rule.setRuleCategory((String) request.get("ruleCategory"));
        rule.setFunctionName((String) request.get("functionName"));
        rule.setInterfaceType((String) request.get("interfaceType"));
        rule.setRequestMethod((String) request.get("requestMethod"));
        rule.setInterfaceUrl((String) request.get("interfaceUrl"));
        rule.setCreatedAt(LocalDateTime.now());
        rule.setUpdatedAt(LocalDateTime.now());
        
        ruleMapper.insert(rule);
        
        // 插入入参
        List<Map<String, Object>> inputParams = (List<Map<String, Object>>) request.get("inputParams");
        if (inputParams != null) {
            for (int i = 0; i < inputParams.size(); i++) {
                Map<String, Object> p = inputParams.get(i);
                OntologyRuleParam param = new OntologyRuleParam();
                param.setId(id + "_in_" + i);
                param.setRuleId(id);
                param.setParamDirection("INPUT");
                param.setParamName((String) p.get("paramName"));
                param.setParamType((String) p.get("paramType"));
                param.setIsRequired(p.get("isRequired") != null && (Boolean) p.get("isRequired") ? 1 : 0);
                param.setDescription((String) p.get("description"));
                param.setSortOrder(i);
                paramMapper.insert(param);
            }
        }
        
        // 插入出参
        List<Map<String, Object>> outputParams = (List<Map<String, Object>>) request.get("outputParams");
        if (outputParams != null) {
            for (int i = 0; i < outputParams.size(); i++) {
                Map<String, Object> p = outputParams.get(i);
                OntologyRuleParam param = new OntologyRuleParam();
                param.setId(id + "_out_" + i);
                param.setRuleId(id);
                param.setParamDirection("OUTPUT");
                param.setParamName((String) p.get("paramName"));
                param.setParamType((String) p.get("paramType"));
                param.setIsRequired(p.get("isRequired") != null && (Boolean) p.get("isRequired") ? 1 : 0);
                param.setDescription((String) p.get("description"));
                param.setSortOrder(i);
                paramMapper.insert(param);
            }
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("rule", rule);
        return result;
    }

    @PutMapping("/{id}")
    public Map<String, Object> update(@PathVariable String id, @RequestBody Map<String, Object> request) {
        OntologyRule rule = ruleMapper.selectById(id);
        if (rule == null) {
            throw new RuntimeException("Rule not found");
        }
        
        if (request.get("ruleCategory") != null) {
            rule.setRuleCategory((String) request.get("ruleCategory"));
        }
        if (request.get("functionName") != null) {
            rule.setFunctionName((String) request.get("functionName"));
        }
        if (request.get("interfaceType") != null) {
            rule.setInterfaceType((String) request.get("interfaceType"));
        }
        if (request.containsKey("requestMethod")) {
            rule.setRequestMethod((String) request.get("requestMethod"));
        }
        if (request.get("interfaceUrl") != null) {
            rule.setInterfaceUrl((String) request.get("interfaceUrl"));
        }
        rule.setUpdatedAt(LocalDateTime.now());
        
        ruleMapper.updateById(rule);
        
        // 删除旧参数并重新插入
        paramMapper.deleteByRuleId(id);
        
        // 插入入参
        List<Map<String, Object>> inputParams = (List<Map<String, Object>>) request.get("inputParams");
        if (inputParams != null) {
            for (int i = 0; i < inputParams.size(); i++) {
                Map<String, Object> p = inputParams.get(i);
                OntologyRuleParam param = new OntologyRuleParam();
                param.setId(id + "_in_" + i);
                param.setRuleId(id);
                param.setParamDirection("INPUT");
                param.setParamName((String) p.get("paramName"));
                param.setParamType((String) p.get("paramType"));
                param.setIsRequired(p.get("isRequired") != null && (Boolean) p.get("isRequired") ? 1 : 0);
                param.setDescription((String) p.get("description"));
                param.setSortOrder(i);
                paramMapper.insert(param);
            }
        }
        
        // 插入出参
        List<Map<String, Object>> outputParams = (List<Map<String, Object>>) request.get("outputParams");
        if (outputParams != null) {
            for (int i = 0; i < outputParams.size(); i++) {
                Map<String, Object> p = outputParams.get(i);
                OntologyRuleParam param = new OntologyRuleParam();
                param.setId(id + "_out_" + i);
                param.setRuleId(id);
                param.setParamDirection("OUTPUT");
                param.setParamName((String) p.get("paramName"));
                param.setParamType((String) p.get("paramType"));
                param.setIsRequired(p.get("isRequired") != null && (Boolean) p.get("isRequired") ? 1 : 0);
                param.setDescription((String) p.get("description"));
                param.setSortOrder(i);
                paramMapper.insert(param);
            }
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("rule", rule);
        return result;
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> delete(@PathVariable String id) {
        // 先删除参数
        paramMapper.deleteByRuleId(id);
        // 再删除规则
        ruleMapper.deleteById(id);
        return Map.of("success", true);
    }
}
