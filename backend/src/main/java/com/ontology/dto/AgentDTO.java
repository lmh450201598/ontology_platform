package com.ontology.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AgentDTO {
    private String id;
    private String name;
    private String description;
    private String targetCompany;
    private String targetIndustry;
    private String analysisFocus;
    private Integer scheduleMinutes;
    private Integer isActive;
    private LocalDateTime lastRunAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
