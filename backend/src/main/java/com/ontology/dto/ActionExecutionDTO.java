package com.ontology.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
public class ActionExecutionDTO {
    private String id;
    private String actionTypeId;
    private String targetObjectId;
    private Map<String, Object> parameters;
    private String status;
    private List<String> validationErrors;
    private List<Map<String, Object>> sideEffects;
    private Map<String, Object> result;
    private String executedBy;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
}
