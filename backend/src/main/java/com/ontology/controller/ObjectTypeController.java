package com.ontology.controller;

import com.ontology.entity.ObjectType;
import com.ontology.entity.Property;
import com.ontology.mapper.ObjectTypeMapper;
import com.ontology.mapper.PropertyMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/object-types")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ObjectTypeController {
    
    private final ObjectTypeMapper objectTypeMapper;
    private final PropertyMapper propertyMapper;
    
    @PostMapping
    public Map<String, Object> create(@RequestBody ObjectType objectType) {
        objectTypeMapper.insert(objectType);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        return result;
    }
    
    @PutMapping("/{id}")
    public Map<String, Object> update(@PathVariable String id, @RequestBody ObjectType objectType) {
        objectType.setId(id);
        objectTypeMapper.updateById(objectType);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        return result;
    }
    
    @DeleteMapping("/{id}")
    public Map<String, Object> delete(@PathVariable String id) {
        objectTypeMapper.deleteById(id);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        return result;
    }
    
    @PostMapping("/{objectTypeId}/properties")
    public Map<String, Object> addProperty(@PathVariable String objectTypeId, @RequestBody Property property) {
        property.setObjectTypeId(objectTypeId);
        propertyMapper.insert(property);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        return result;
    }
    
    @DeleteMapping("/{objectTypeId}/properties/{propId}")
    public Map<String, Object> deleteProperty(@PathVariable String objectTypeId, @PathVariable String propId) {
        propertyMapper.deleteById(propId);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        return result;
    }
}
