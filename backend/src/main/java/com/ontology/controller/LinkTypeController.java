package com.ontology.controller;

import com.ontology.entity.LinkType;
import com.ontology.mapper.LinkTypeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/link-types")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LinkTypeController {
    
    private final LinkTypeMapper linkTypeMapper;
    
    @PostMapping
    public Map<String, Object> create(@RequestBody LinkType linkType) {
        linkTypeMapper.insert(linkType);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        return result;
    }
    
    @PutMapping("/{id}")
    public Map<String, Object> update(@PathVariable String id, @RequestBody LinkType linkType) {
        linkType.setId(id);
        linkTypeMapper.updateById(linkType);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        return result;
    }
    
    @DeleteMapping("/{id}")
    public Map<String, Object> delete(@PathVariable String id) {
        linkTypeMapper.deleteById(id);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        return result;
    }
}
