package com.ontology.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("agent_analyses")
public class AgentAnalysis {
    
    @TableId(type = IdType.INPUT)
    private String id;
    
    private String agentId;
    
    private String eventId;
    
    private String title;
    
    private String content;
    
    private String keyFindings;
    
    private String impactChain;
    
    private String recommendation;
    
    private LocalDateTime createdAt;
}
