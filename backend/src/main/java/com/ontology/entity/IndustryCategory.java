package com.ontology.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("industry_categories")
public class IndustryCategory {
    
    @TableId(type = IdType.INPUT)
    private String id;
    
    private String code;
    
    private String name;
    
    private Integer level;
    
    private String parentId;
    
    private Integer sortOrder;
    
    private String description;
    
    private LocalDateTime createdAt;
}
