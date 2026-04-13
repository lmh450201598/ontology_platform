package com.ontology.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@TableName("object_types")
public class ObjectType {
    
    @TableId(type = IdType.INPUT)
    private String id;
    
    private String name;
    
    private String description;
    
    private String icon;
    
    private String backingDataset;
    
    private String industryId;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;

    private String status;

    @TableField(exist = false)
    private List<Property> properties;
}
