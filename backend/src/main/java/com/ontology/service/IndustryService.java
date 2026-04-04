package com.ontology.service;

import com.ontology.entity.IndustryCategory;
import com.ontology.mapper.IndustryCategoryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IndustryService {
    
    private final IndustryCategoryMapper industryCategoryMapper;
    
    public List<IndustryCategory> listAll() {
        return industryCategoryMapper.selectAllOrdered();
    }
    
    public List<Map<String, Object>> buildTree() {
        List<IndustryCategory> all = industryCategoryMapper.selectAllOrdered();
        Map<String, Map<String, Object>> map = new HashMap<>();
        List<Map<String, Object>> roots = new ArrayList<>();
        
        for (IndustryCategory ind : all) {
            Map<String, Object> node = new HashMap<>();
            node.put("id", ind.getId());
            node.put("code", ind.getCode());
            node.put("name", ind.getName());
            node.put("level", ind.getLevel());
            node.put("parentId", ind.getParentId());
            node.put("sortOrder", ind.getSortOrder());
            node.put("description", ind.getDescription());
            node.put("children", new ArrayList<>());
            map.put(ind.getId(), node);
        }
        
        for (IndustryCategory ind : all) {
            Map<String, Object> node = map.get(ind.getId());
            if (ind.getParentId() != null && map.containsKey(ind.getParentId())) {
                ((List) map.get(ind.getParentId()).get("children")).add(node);
            } else {
                roots.add(node);
            }
        }
        
        return roots;
    }
}
