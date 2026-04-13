package com.ontology.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("notifications")
public class Notification {
    
    @TableId(type = IdType.INPUT)
    private String id;
    
    private String title;
    
    private String content;
    
    private String type;
    
    private String status;
    
    private String userId;
    
    private String relatedObjectType;
    
    private String relatedObjectId;
    
    private String actionUrl;
    
    private LocalDateTime readAt;
    
    private LocalDateTime createdAt;
}
