package com.ontology.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/datasets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DatasetController {

    private final JdbcTemplate jdbcTemplate;

    /**
     * 获取指定数据集的表结构（列信息）
     * @param datasetName 数据集名称（对应MySQL表名）
     * @return 列信息列表，包含列名和注释
     */
    @GetMapping("/{datasetName}/columns")
    public Map<String, Object> getTableColumns(@PathVariable String datasetName) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 查询表的所有列及其注释
            String sql = """
                SELECT 
                    COLUMN_NAME as columnName,
                    COLUMN_COMMENT as columnComment,
                    DATA_TYPE as dataType,
                    IS_NULLABLE as isNullable
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = 'ontology' 
                AND TABLE_NAME = ?
                ORDER BY ORDINAL_POSITION
                """;
            
            List<Map<String, Object>> columns = jdbcTemplate.queryForList(sql, datasetName);
            
            // 如果没有注释，使用列名作为显示名称
            for (Map<String, Object> col : columns) {
                String comment = (String) col.get("columnComment");
                if (comment == null || comment.trim().isEmpty()) {
                    col.put("columnComment", col.get("columnName"));
                }
            }
            
            result.put("success", true);
            result.put("data", columns);
            result.put("datasetName", datasetName);
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", "获取表结构失败: " + e.getMessage());
        }
        
        return result;
    }

    /**
     * 获取所有可用的数据集（表）列表
     */
    @GetMapping
    public Map<String, Object> getAllDatasets() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            String sql = """
                SELECT 
                    TABLE_NAME as tableName,
                    TABLE_COMMENT as tableComment
                FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_SCHEMA = 'ontology'
                AND TABLE_TYPE = 'BASE TABLE'
                """;
            
            List<Map<String, Object>> tables = jdbcTemplate.queryForList(sql);
            
            result.put("success", true);
            result.put("data", tables);
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", "获取数据集列表失败: " + e.getMessage());
        }
        
        return result;
    }
}
