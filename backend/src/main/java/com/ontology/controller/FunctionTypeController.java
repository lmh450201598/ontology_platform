package com.ontology.controller;

import com.ontology.entity.FunctionType;
import com.ontology.mapper.FunctionTypeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FunctionTypeController {
    
    private final FunctionTypeMapper functionTypeMapper;
    
    @GetMapping("/function-types")
    public Map<String, Object> getAll() {
        List<FunctionType> list = functionTypeMapper.selectAllOrdered();
        return Map.of("functions", list);
    }
    
    @PostMapping("/function-types")
    public Map<String, Object> create(@RequestBody Map<String, Object> data) {
        FunctionType ft = new FunctionType();
        ft.setId((String) data.getOrDefault("id", "func_" + System.currentTimeMillis()));
        ft.setName((String) data.get("name"));
        ft.setRestRoute((String) data.get("restRoute"));
        ft.setDescription((String) data.get("description"));
        
        // 处理入参 - 默认包含本体图谱
        Map<String, Object> inputParams = new HashMap<>();
        Map<String, Object> ontologyParam = new HashMap<>();
        ontologyParam.put("name", "ontologyGraph");
        ontologyParam.put("type", "object");
        ontologyParam.put("description", "本体图谱数据（包含对象类型和链接类型）");
        ontologyParam.put("required", true);
        ontologyParam.put("default", true); // 标记为默认参数
        
        List<Map<String, Object>> customInputs = (List<Map<String, Object>>) data.getOrDefault("inputParams", new ArrayList<>());
        inputParams.put("ontologyGraph", ontologyParam);
        inputParams.put("custom", customInputs);
        ft.setInputParams(toJson(inputParams));
        
        // 处理出参
        List<Map<String, Object>> outputParams = (List<Map<String, Object>>) data.getOrDefault("outputParams", new ArrayList<>());
        ft.setOutputParams(toJson(Map.of("params", outputParams)));
        
        ft.setCreatedAt(LocalDateTime.now());
        ft.setUpdatedAt(LocalDateTime.now());
        
        functionTypeMapper.insert(ft);
        
        return Map.of("success", true, "data", ft);
    }
    
    @PutMapping("/function-types/{id}")
    public Map<String, Object> update(@PathVariable String id, @RequestBody Map<String, Object> data) {
        FunctionType ft = functionTypeMapper.selectById(id);
        if (ft == null) {
            throw new RuntimeException("Function type not found");
        }
        
        if (data.containsKey("name")) ft.setName((String) data.get("name"));
        if (data.containsKey("restRoute")) ft.setRestRoute((String) data.get("restRoute"));
        if (data.containsKey("description")) ft.setDescription((String) data.get("description"));
        
        // 更新入参
        if (data.containsKey("inputParams")) {
            Map<String, Object> inputParams = new HashMap<>();
            Map<String, Object> ontologyParam = new HashMap<>();
            ontologyParam.put("name", "ontologyGraph");
            ontologyParam.put("type", "object");
            ontologyParam.put("description", "本体图谱数据（包含对象类型和链接类型）");
            ontologyParam.put("required", true);
            ontologyParam.put("default", true);
            
            List<Map<String, Object>> customInputs = (List<Map<String, Object>>) data.getOrDefault("inputParams", new ArrayList<>());
            inputParams.put("ontologyGraph", ontologyParam);
            inputParams.put("custom", customInputs);
            ft.setInputParams(toJson(inputParams));
        }
        
        // 更新出参
        if (data.containsKey("outputParams")) {
            List<Map<String, Object>> outputParams = (List<Map<String, Object>>) data.get("outputParams");
            ft.setOutputParams(toJson(Map.of("params", outputParams)));
        }
        
        ft.setUpdatedAt(LocalDateTime.now());
        functionTypeMapper.updateById(ft);
        
        return Map.of("success", true, "data", ft);
    }
    
    @DeleteMapping("/function-types/{id}")
    public Map<String, Object> delete(@PathVariable String id) {
        functionTypeMapper.deleteById(id);
        return Map.of("success", true);
    }
    
    @GetMapping("/function-types/{id}")
    public Map<String, Object> getById(@PathVariable String id) {
        FunctionType ft = functionTypeMapper.selectById(id);
        if (ft == null) {
            throw new RuntimeException("Function type not found");
        }
        return Map.of("success", true, "data", ft);
    }
    
    private String toJson(Object obj) {
        if (obj == null) return null;
        return obj.toString();
    }
}
