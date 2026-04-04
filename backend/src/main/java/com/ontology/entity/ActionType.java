package com.ontology.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@TableName("action_types")
public class ActionType {
    
    @TableId(type = IdType.INPUT)
    private String id;
    
    private String name;
    
    private String description;
    
    private String targetObjectId;
    
    private String industryId;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    @TableField(exist = false)
    private List<ActionParameter> parameters;
    
    @TableField(exist = false)
    private List<ActionRule> rules;
}
