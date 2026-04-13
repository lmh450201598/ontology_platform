package com.ontology.controller;

import com.ontology.entity.ObjectType;
import com.ontology.entity.Property;
import com.ontology.mapper.ObjectTypeMapper;
import com.ontology.mapper.PropertyMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/instances")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InstanceDataController {

    private final ObjectTypeMapper objectTypeMapper;
    private final PropertyMapper propertyMapper;
    private final JdbcTemplate jdbcTemplate;

    /**
     * 获取对象类型的所有实例
     * GET /api/instances/{objectTypeId}
     */
    @GetMapping("/{objectTypeId}")
    public Map<String, Object> listInstances(
            @PathVariable String objectTypeId,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Integer offset) {
        
        ObjectType objectType = objectTypeMapper.selectById(objectTypeId);
        if (objectType == null) {
            throw new RuntimeException("Object type not found: " + objectTypeId);
        }
        
        String tableName = objectType.getBackingDataset();
        if (tableName == null || tableName.isEmpty()) {
            return Map.of("success", true, "data", Collections.emptyList(), "total", 0);
        }
        
        // 获取属性列表
        List<Property> properties = propertyMapper.selectByObjectTypeId(objectTypeId);
        
        // 构建查询列
        List<String> columns = new ArrayList<>();
        for (Property prop : properties) {
            if (prop.getBaseColumn() != null && !prop.getBaseColumn().isEmpty()) {
                columns.add("`" + prop.getBaseColumn() + "`");
            }
        }
        
        if (columns.isEmpty()) {
            return Map.of("success", true, "data", Collections.emptyList(), "total", 0);
        }
        
        String columnList = String.join(", ", columns);
        int limitVal = limit != null ? limit : 100;
        int offsetVal = offset != null ? offset : 0;
        
        // 查询数据
        String sql = String.format("SELECT %s FROM `%s` LIMIT %d OFFSET %d", columnList, tableName, limitVal, offsetVal);
        String countSql = String.format("SELECT COUNT(*) FROM `%s`", tableName);
        
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql);
        Integer total = jdbcTemplate.queryForObject(countSql, Integer.class);
        
        // 将数据库列名映射为属性ID
        List<Map<String, Object>> mappedData = new ArrayList<>();
        for (Map<String, Object> row : rows) {
            Map<String, Object> mapped = new LinkedHashMap<>();
            for (Property prop : properties) {
                if (prop.getBaseColumn() != null && !prop.getBaseColumn().isEmpty()) {
                    Object value = row.get(prop.getBaseColumn());
                    mapped.put(prop.getId(), value);
                }
            }
            mappedData.add(mapped);
        }
        
        return Map.of("success", true, "data", mappedData, "total", total, "objectType", objectType);
    }

    /**
     * 获取单个实例
     * GET /api/instances/{objectTypeId}/{instanceId}
     */
    @GetMapping("/{objectTypeId}/{instanceId}")
    public Map<String, Object> getInstance(
            @PathVariable String objectTypeId,
            @PathVariable String instanceId) {
        
        ObjectType objectType = objectTypeMapper.selectById(objectTypeId);
        if (objectType == null) {
            throw new RuntimeException("Object type not found: " + objectTypeId);
        }
        
        String tableName = objectType.getBackingDataset();
        List<Property> properties = propertyMapper.selectByObjectTypeId(objectTypeId);
        
        // 找到主键属性
        Property pkProp = properties.stream()
                .filter(p -> p.getIsPrimaryKey() != null && p.getIsPrimaryKey() == 1)
                .findFirst()
                .orElse(properties.isEmpty() ? null : properties.get(0));
        
        if (pkProp == null || pkProp.getBaseColumn() == null) {
            throw new RuntimeException("No primary key property found");
        }
        
        // 构建查询
        List<String> columns = new ArrayList<>();
        for (Property prop : properties) {
            if (prop.getBaseColumn() != null && !prop.getBaseColumn().isEmpty()) {
                columns.add("`" + prop.getBaseColumn() + "`");
            }
        }
        
        String columnList = String.join(", ", columns);
        String sql = String.format("SELECT %s FROM `%s` WHERE `%s` = ?", columnList, tableName, pkProp.getBaseColumn());
        
        Map<String, Object> row = jdbcTemplate.queryForMap(sql, instanceId);
        
        // 映射数据
        Map<String, Object> mapped = new LinkedHashMap<>();
        for (Property prop : properties) {
            if (prop.getBaseColumn() != null && !prop.getBaseColumn().isEmpty()) {
                Object value = row.get(prop.getBaseColumn());
                mapped.put(prop.getId(), value);
            }
        }
        
        return Map.of("success", true, "data", mapped);
    }

    /**
     * 创建实例
     * POST /api/instances/{objectTypeId}
     */
    @PostMapping("/{objectTypeId}")
    public Map<String, Object> createInstance(
            @PathVariable String objectTypeId,
            @RequestBody Map<String, Object> data) {
        
        ObjectType objectType = objectTypeMapper.selectById(objectTypeId);
        if (objectType == null) {
            throw new RuntimeException("Object type not found: " + objectTypeId);
        }
        
        String tableName = objectType.getBackingDataset();
        List<Property> properties = propertyMapper.selectByObjectTypeId(objectTypeId);
        
        // 构建插入语句
        List<String> columns = new ArrayList<>();
        List<String> placeholders = new ArrayList<>();
        List<Object> values = new ArrayList<>();
        
        for (Property prop : properties) {
            if (prop.getBaseColumn() != null && !prop.getBaseColumn().isEmpty()) {
                Object value = data.get(prop.getId());
                if (value != null) {
                    columns.add("`" + prop.getBaseColumn() + "`");
                    placeholders.add("?");
                    values.add(value);
                }
            }
        }
        
        // 添加时间戳字段
        columns.add("`created_at`");
        placeholders.add("?");
        values.add(LocalDateTime.now());
        columns.add("`updated_at`");
        placeholders.add("?");
        values.add(LocalDateTime.now());
        
        String sql = String.format("INSERT INTO `%s` (%s) VALUES (%s)", 
                tableName, 
                String.join(", ", columns), 
                String.join(", ", placeholders));
        
        jdbcTemplate.update(sql, values.toArray());
        
        return Map.of("success", true, "message", "Instance created successfully");
    }

    /**
     * 更新实例
     * PUT /api/instances/{objectTypeId}/{instanceId}
     */
    @PutMapping("/{objectTypeId}/{instanceId}")
    public Map<String, Object> updateInstance(
            @PathVariable String objectTypeId,
            @PathVariable String instanceId,
            @RequestBody Map<String, Object> data) {
        
        ObjectType objectType = objectTypeMapper.selectById(objectTypeId);
        if (objectType == null) {
            throw new RuntimeException("Object type not found: " + objectTypeId);
        }
        
        String tableName = objectType.getBackingDataset();
        List<Property> properties = propertyMapper.selectByObjectTypeId(objectTypeId);
        
        // 找到主键属性
        Property pkProp = properties.stream()
                .filter(p -> p.getIsPrimaryKey() != null && p.getIsPrimaryKey() == 1)
                .findFirst()
                .orElse(properties.isEmpty() ? null : properties.get(0));
        
        if (pkProp == null || pkProp.getBaseColumn() == null) {
            throw new RuntimeException("No primary key property found");
        }
        
        // 构建更新语句
        List<String> setClauses = new ArrayList<>();
        List<Object> values = new ArrayList<>();
        
        for (Property prop : properties) {
            if (prop.getBaseColumn() != null && !prop.getBaseColumn().isEmpty()) {
                // 不更新主键
                if (prop.getIsPrimaryKey() != null && prop.getIsPrimaryKey() == 1) {
                    continue;
                }
                Object value = data.get(prop.getId());
                if (value != null) {
                    setClauses.add("`" + prop.getBaseColumn() + "` = ?");
                    values.add(value);
                }
            }
        }
        
        // 添加更新时间
        setClauses.add("`updated_at` = ?");
        values.add(LocalDateTime.now());
        
        // 添加WHERE条件参数
        values.add(instanceId);
        
        String sql = String.format("UPDATE `%s` SET %s WHERE `%s` = ?", 
                tableName, 
                String.join(", ", setClauses), 
                pkProp.getBaseColumn());
        
        int rows = jdbcTemplate.update(sql, values.toArray());
        
        return Map.of("success", rows > 0, "message", rows > 0 ? "Instance updated successfully" : "Instance not found");
    }

    /**
     * 删除实例
     * DELETE /api/instances/{objectTypeId}/{instanceId}
     */
    @DeleteMapping("/{objectTypeId}/{instanceId}")
    public Map<String, Object> deleteInstance(
            @PathVariable String objectTypeId,
            @PathVariable String instanceId) {
        
        ObjectType objectType = objectTypeMapper.selectById(objectTypeId);
        if (objectType == null) {
            throw new RuntimeException("Object type not found: " + objectTypeId);
        }
        
        String tableName = objectType.getBackingDataset();
        List<Property> properties = propertyMapper.selectByObjectTypeId(objectTypeId);
        
        // 找到主键属性
        Property pkProp = properties.stream()
                .filter(p -> p.getIsPrimaryKey() != null && p.getIsPrimaryKey() == 1)
                .findFirst()
                .orElse(properties.isEmpty() ? null : properties.get(0));
        
        if (pkProp == null || pkProp.getBaseColumn() == null) {
            throw new RuntimeException("No primary key property found");
        }
        
        String sql = String.format("DELETE FROM `%s` WHERE `%s` = ?", tableName, pkProp.getBaseColumn());
        int rows = jdbcTemplate.update(sql, instanceId);
        
        return Map.of("success", rows > 0, "message", rows > 0 ? "Instance deleted successfully" : "Instance not found");
    }
}
