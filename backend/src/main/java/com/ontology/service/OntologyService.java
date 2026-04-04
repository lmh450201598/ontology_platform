package com.ontology.service;

import com.ontology.entity.*;
import com.ontology.mapper.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OntologyService {
    
    private final ObjectTypeMapper objectTypeMapper;
    private final PropertyMapper propertyMapper;
    private final LinkTypeMapper linkTypeMapper;
    private final ActionTypeMapper actionTypeMapper;
    private final ActionParameterMapper actionParameterMapper;
    private final ActionRuleMapper actionRuleMapper;
    private final IndustryCategoryMapper industryCategoryMapper;
    
    public Map<String, Object> buildOntologyData() {
        Map<String, Object> result = new HashMap<>();
        
        // Object Types with Properties
        List<ObjectType> objectTypes = objectTypeMapper.selectAllOrdered();
        for (ObjectType ot : objectTypes) {
            ot.setProperties(propertyMapper.selectByObjectTypeId(ot.getId()));
        }
        result.put("objectTypes", objectTypes);
        
        // Link Types
        List<LinkType> linkTypes = linkTypeMapper.selectAllOrdered();
        result.put("linkTypes", linkTypes);
        
        // Action Types with Parameters and Rules
        List<ActionType> actionTypes = actionTypeMapper.selectAllOrdered();
        for (ActionType at : actionTypes) {
            at.setParameters(actionParameterMapper.selectByActionTypeId(at.getId()));
            at.setRules(actionRuleMapper.selectByActionTypeId(at.getId()));
        }
        result.put("actionTypes", actionTypes);
        
        return result;
    }
    
    public Map<String, Object> getIndustryOntology(String industryId) {
        Map<String, Object> result = new HashMap<>();
        
        // Get industry info
        IndustryCategory industry = industryCategoryMapper.selectById(industryId);
        result.put("industry", industry);
        
        // Collect descendant industry IDs
        Set<String> descendantIds = collectDescendantIds(industryId);
        
        // Object Types
        List<ObjectType> objectTypes = objectTypeMapper.selectList(
            new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<ObjectType>()
                .in(ObjectType::getIndustryId, descendantIds)
                .orderByAsc(ObjectType::getName)
        );
        
        List<String> otIds = objectTypes.stream().map(ObjectType::getId).collect(Collectors.toList());
        
        // Properties
        List<Property> properties = new ArrayList<>();
        if (!otIds.isEmpty()) {
            properties = propertyMapper.selectList(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<Property>()
                    .in(Property::getObjectTypeId, otIds)
                    .orderByAsc(Property::getObjectTypeId)
                    .orderByAsc(Property::getSortOrder)
            );
        }
        
        // Link Types
        List<LinkType> linkTypes = linkTypeMapper.selectList(
            new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<LinkType>()
                .in(LinkType::getIndustryId, descendantIds)
                .or().in(LinkType::getSourceObjectId, otIds)
                .or().in(LinkType::getTargetObjectId, otIds)
                .orderByAsc(LinkType::getName)
        );
        
        // Action Types
        List<ActionType> actionTypes = actionTypeMapper.selectList(
            new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<ActionType>()
                .in(ActionType::getIndustryId, descendantIds)
                .or().in(ActionType::getTargetObjectId, otIds)
                .orderByAsc(ActionType::getName)
        );
        
        List<String> atIds = actionTypes.stream().map(ActionType::getId).collect(Collectors.toList());
        
        // Action Parameters and Rules
        List<ActionParameter> actionParams = new ArrayList<>();
        List<ActionRule> actionRules = new ArrayList<>();
        if (!atIds.isEmpty()) {
            actionParams = actionParameterMapper.selectList(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<ActionParameter>()
                    .in(ActionParameter::getActionTypeId, atIds)
                    .orderByAsc(ActionParameter::getActionTypeId)
                    .orderByAsc(ActionParameter::getSortOrder)
            );
            actionRules = actionRuleMapper.selectList(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<ActionRule>()
                    .in(ActionRule::getActionTypeId, atIds)
                    .orderByAsc(ActionRule::getActionTypeId)
            );
        }
        
        // Build result with nested properties
        final List<Property> finalProperties = properties;
        List<Map<String, Object>> otResult = objectTypes.stream().map(ot -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", ot.getId());
            map.put("name", ot.getName());
            map.put("description", ot.getDescription());
            map.put("icon", ot.getIcon());
            map.put("backingDataset", ot.getBackingDataset());
            map.put("industryId", ot.getIndustryId());
            map.put("properties", finalProperties.stream()
                .filter(p -> p.getObjectTypeId().equals(ot.getId()))
                .collect(Collectors.toList()));
            return map;
        }).collect(Collectors.toList());
        
        final List<ActionParameter> finalActionParams = actionParams;
        final List<ActionRule> finalActionRules = actionRules;
        List<Map<String, Object>> atResult = actionTypes.stream().map(at -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", at.getId());
            map.put("name", at.getName());
            map.put("description", at.getDescription());
            map.put("targetObjectId", at.getTargetObjectId());
            map.put("industryId", at.getIndustryId());
            map.put("parameters", finalActionParams.stream()
                .filter(p -> p.getActionTypeId().equals(at.getId()))
                .collect(Collectors.toList()));
            map.put("rules", finalActionRules.stream()
                .filter(r -> r.getActionTypeId().equals(at.getId()))
                .collect(Collectors.toList()));
            return map;
        }).collect(Collectors.toList());
        
        result.put("objectTypes", otResult);
        result.put("linkTypes", linkTypes);
        result.put("actionTypes", atResult);
        
        return result;
    }
    
    private Set<String> collectDescendantIds(String industryId) {
        Set<String> ids = new HashSet<>();
        ids.add(industryId);
        
        List<IndustryCategory> all = industryCategoryMapper.selectList(null);
        boolean changed = true;
        while (changed) {
            changed = false;
            for (IndustryCategory ind : all) {
                if (ind.getParentId() != null && ids.contains(ind.getParentId()) && !ids.contains(ind.getId())) {
                    ids.add(ind.getId());
                    changed = true;
                }
            }
        }
        return ids;
    }
}
