package com.ontology.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class AgentAnalysisDTO {
    private String id;
    private String agentId;
    private String eventId;
    private String title;
    private String content;
    private List<String> keyFindings;
    private List<ImpactChainDTO> impactChain;
    private String recommendation;
    private LocalDateTime createdAt;
}
