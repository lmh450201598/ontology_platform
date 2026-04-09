package com.ontology.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("function_type")
public class FunctionType {
    
    @TableId(type = IdType.INPUT)
    private String id;
    
    private String name;
    
    private String restRoute;
    
    private String inputParams;
    
    private String outputParams;
    
    private String description;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}
