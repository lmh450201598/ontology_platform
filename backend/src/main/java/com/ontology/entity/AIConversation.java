package com.ontology.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("ai_conversations")
public class AIConversation {
    
    @TableId(type = IdType.INPUT)
    private String id;
    
    private String title;
    
    private String messages;
    
    private String previewOntology;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}
