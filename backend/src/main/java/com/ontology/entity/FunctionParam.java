package com.ontology.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("function_params")
public class FunctionParam {
    
    @TableId(type = IdType.INPUT)
    private String id;
    
    private String functionId;
    
    private String paramDirection;
    
    private String paramName;
    
    private String paramCode;
    
    private String paramType;
    
    private Integer isRequired;
    
    private String defaultValue;
    
    private String description;
    
    private Integer sortOrder;
    
    private String sourceType;
}
