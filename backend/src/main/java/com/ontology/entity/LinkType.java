package com.ontology.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("link_types")
public class LinkType {
    
    @TableId(type = IdType.INPUT)
    private String id;
    
    private String name;
    
    private String sourceObjectId;
    
    private String targetObjectId;
    
    private String cardinality;
    
    private String description;
    
    private String industryId;
    
    private String sourceColumn;
    
    private String targetColumn;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}
