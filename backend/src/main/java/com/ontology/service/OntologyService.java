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
    private final ActionRuleMapper actionRuleMapper;
    private final ActionEffectMapper actionEffectMapper;
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
        
        // Action Types with Rules and Effects
        List<ActionType> actionTypes = actionTypeMapper.selectAllActive();
        for (ActionType at : actionTypes) {
            at.setRules(actionRuleMapper.selectByActionTypeId(at.getId()));
            at.setEffects(actionEffectMapper.selectByActionTypeId(at.getId()));
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
                .eq(ActionType::getStatus, "ACTIVE")
                .orderByAsc(ActionType::getDisplayName)
        );
        
        List<String> atIds = actionTypes.stream().map(ActionType::getId).collect(Collectors.toList());
        
        // Action Rules and Effects
        List<ActionRule> actionRules = new ArrayList<>();
        List<ActionEffect> actionEffects = new ArrayList<>();
        if (!atIds.isEmpty()) {
            actionRules = actionRuleMapper.selectList(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<ActionRule>()
                    .in(ActionRule::getActionTypeId, atIds)
                    .orderByAsc(ActionRule::getActionTypeId)
            );
            actionEffects = actionEffectMapper.selectList(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<ActionEffect>()
                    .in(ActionEffect::getActionTypeId, atIds)
                    .orderByAsc(ActionEffect::getActionTypeId)
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
        
        final List<ActionRule> finalActionRules = actionRules;
        final List<ActionEffect> finalActionEffects = actionEffects;
        List<Map<String, Object>> atResult = actionTypes.stream().map(at -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", at.getId());
            map.put("displayName", at.getDisplayName());
            map.put("description", at.getDescription());
            map.put("status", at.getStatus());
            map.put("rules", finalActionRules.stream()
                .filter(r -> r.getActionTypeId().equals(at.getId()))
                .collect(Collectors.toList()));
            map.put("effects", finalActionEffects.stream()
                .filter(e -> e.getActionTypeId().equals(at.getId()))
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
