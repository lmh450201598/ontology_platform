package com.ontology.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("action_executions")
public class ActionExecution {
    
    @TableId(type = IdType.INPUT)
    private String id;
    
    private String actionTypeId;
    
    private String targetObjectId;
    
    private String parameters;
    
    private String status;
    
    private String validationErrors;
    
    private String sideEffects;
    
    private String result;
    
    private String executedBy;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime completedAt;
}
