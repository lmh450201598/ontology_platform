package com.ontology.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class AgentEventDTO {
    private String id;
    private String agentId;
    private String title;
    private String summary;
    private String source;
    private String sourceUrl;
    private String eventDate;
    private String impactLevel;
    private List<String> relatedEntities;
    private LocalDateTime createdAt;
}
