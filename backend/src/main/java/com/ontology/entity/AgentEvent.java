package com.ontology.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("agent_events")
public class AgentEvent {
    
    @TableId(type = IdType.INPUT)
    private String id;
    
    private String agentId;
    
    private String title;
    
    private String summary;
    
    private String source;
    
    private String sourceUrl;
    
    private String eventDate;
    
    private String impactLevel;
    
    private String relatedEntities;
    
    private LocalDateTime createdAt;
}
