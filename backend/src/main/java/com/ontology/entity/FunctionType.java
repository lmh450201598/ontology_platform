package com.ontology.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@TableName("function_types")
public class FunctionType {
    
    @TableId(type = IdType.INPUT)
    private String id;
    
    private String name;
    
    private String code;
    
    private String description;
    
    private String category;
    
    private String interfaceType;
    
    private String requestMethod;
    
    private String interfaceUrl;
    
    private String implementationType;
    
    private String status;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    @TableField(exist = false)
    private List<FunctionParam> inputParams;
    
    @TableField(exist = false)
    private List<FunctionParam> outputParams;
}
