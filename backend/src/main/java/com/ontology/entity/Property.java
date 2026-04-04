package com.ontology.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("properties")
public class Property {
    
    @TableId(type = IdType.INPUT)
    private String id;
    
    private String objectTypeId;
    
    private String name;
    
    private String type;
    
    private String description;
    
    private Integer isPrimaryKey;
    
    private String baseColumn;
    
    private String typeClasses;
    
    private Integer sortOrder;
}
