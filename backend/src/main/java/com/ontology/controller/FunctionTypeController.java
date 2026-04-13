package com.ontology.controller;

import com.ontology.entity.FunctionParam;
import com.ontology.entity.FunctionType;
import com.ontology.mapper.FunctionParamMapper;
import com.ontology.mapper.FunctionTypeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/function-types")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FunctionTypeController {
    
    private final FunctionTypeMapper functionTypeMapper;
    private final FunctionParamMapper functionParamMapper;
    
    @GetMapping
    public Map<String, Object> list(@RequestParam(required = false) String category) {
        List<FunctionType> list;
        if (category != null && !category.isEmpty()) {
            list = functionTypeMapper.selectByCategory(category);
        } else {
            list = functionTypeMapper.selectAllActive();
        }
        
        // 加载参数
        for (FunctionType ft : list) {
            loadParams(ft);
        }
        
        return Map.of("success", true, "functions", list);
    }
    
    @GetMapping("/{id}")
    public Map<String, Object> getById(@PathVariable String id) {
        FunctionType ft = functionTypeMapper.selectById(id);
        if (ft == null) {
            return Map.of("success", false, "error", "Function not found");
        }
        loadParams(ft);
        return Map.of("success", true, "function", ft);
    }
    
    @PostMapping
    @Transactional
    public Map<String, Object> create(@RequestBody Map<String, Object> data) {
        FunctionType ft = new FunctionType();
        ft.setId("func_" + System.currentTimeMillis());
        ft.setCode((String) data.get("code"));
        ft.setName((String) data.get("name"));
        ft.setDescription((String) data.get("description"));
        ft.setCategory((String) data.get("category"));
        ft.setInterfaceType((String) data.getOrDefault("interfaceType", "RESTFUL"));
        ft.setRequestMethod((String) data.get("requestMethod"));
        ft.setInterfaceUrl((String) data.get("interfaceUrl"));
        ft.setImplementationType((String) data.getOrDefault("implementationType", "JAVA"));
        ft.setStatus("ACTIVE");
        ft.setCreatedAt(LocalDateTime.now());
        ft.setUpdatedAt(LocalDateTime.now());
        
        functionTypeMapper.insert(ft);
        
        // 保存参数
        saveParams(ft.getId(), data);
        
        return Map.of("success", true, "function", ft);
    }
    
    @PutMapping("/{id}")
    @Transactional
    public Map<String, Object> update(@PathVariable String id, @RequestBody Map<String, Object> data) {
        FunctionType ft = functionTypeMapper.selectById(id);
        if (ft == null) {
            return Map.of("success", false, "error", "Function not found");
        }
        
        if (data.containsKey("name")) ft.setName((String) data.get("name"));
        if (data.containsKey("description")) ft.setDescription((String) data.get("description"));
        if (data.containsKey("category")) ft.setCategory((String) data.get("category"));
        if (data.containsKey("interfaceType")) ft.setInterfaceType((String) data.get("interfaceType"));
        if (data.containsKey("requestMethod")) ft.setRequestMethod((String) data.get("requestMethod"));
        if (data.containsKey("interfaceUrl")) ft.setInterfaceUrl((String) data.get("interfaceUrl"));
        if (data.containsKey("implementationType")) ft.setImplementationType((String) data.get("implementationType"));
        if (data.containsKey("status")) ft.setStatus((String) data.get("status"));
        
        ft.setUpdatedAt(LocalDateTime.now());
        functionTypeMapper.updateById(ft);
        
        // 更新参数
        if (data.containsKey("inputParams") || data.containsKey("outputParams")) {
            functionParamMapper.deleteByFunctionId(id);
            saveParams(id, data);
        }
        
        return Map.of("success", true, "function", ft);
    }
    
    @DeleteMapping("/{id}")
    @Transactional
    public Map<String, Object> delete(@PathVariable String id) {
        // 软删除
        FunctionType ft = new FunctionType();
        ft.setId(id);
        ft.setStatus("DISABLED");
        ft.setUpdatedAt(LocalDateTime.now());
        functionTypeMapper.updateById(ft);
        
        return Map.of("success", true);
    }
    
    private void loadParams(FunctionType ft) {
        List<FunctionParam> allParams = functionParamMapper.selectByFunctionId(ft.getId());
        ft.setInputParams(allParams.stream()
                .filter(p -> "INPUT".equals(p.getParamDirection()))
                .toList());
        ft.setOutputParams(allParams.stream()
                .filter(p -> "OUTPUT".equals(p.getParamDirection()))
                .toList());
    }
    
    @SuppressWarnings("unchecked")
    private void saveParams(String functionId, Map<String, Object> data) {
        int sortOrder = 0;
        
        // 保存入参
        List<Map<String, Object>> inputParams = (List<Map<String, Object>>) data.get("inputParams");
        if (inputParams != null) {
            for (Map<String, Object> param : inputParams) {
                FunctionParam fp = new FunctionParam();
                fp.setId("fp_" + System.currentTimeMillis() + "_" + sortOrder);
                fp.setFunctionId(functionId);
                fp.setParamDirection("INPUT");
                fp.setParamName((String) param.get("paramName"));
                fp.setParamCode((String) param.get("paramCode"));
                fp.setParamType((String) param.get("paramType"));
                fp.setIsRequired((Boolean) param.getOrDefault("isRequired", false) ? 1 : 0);
                fp.setDefaultValue((String) param.get("defaultValue"));
                fp.setDescription((String) param.get("description"));
                fp.setSourceType((String) param.getOrDefault("sourceType", "USER_INPUT"));
                fp.setSortOrder(sortOrder++);
                functionParamMapper.insert(fp);
            }
        }
        
        // 保存出参
        List<Map<String, Object>> outputParams = (List<Map<String, Object>>) data.get("outputParams");
        if (outputParams != null) {
            sortOrder = 0;
            for (Map<String, Object> param : outputParams) {
                FunctionParam fp = new FunctionParam();
                fp.setId("fp_" + System.currentTimeMillis() + "_out_" + sortOrder);
                fp.setFunctionId(functionId);
                fp.setParamDirection("OUTPUT");
                fp.setParamName((String) param.get("paramName"));
                fp.setParamCode((String) param.get("paramCode"));
                fp.setParamType((String) param.get("paramType"));
                fp.setIsRequired(0);
                fp.setDescription((String) param.get("description"));
                fp.setSortOrder(sortOrder++);
                functionParamMapper.insert(fp);
            }
        }
    }
}
