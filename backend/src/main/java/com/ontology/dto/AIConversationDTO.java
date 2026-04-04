package com.ontology.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class AIConversationDTO {
    private String id;
    private String title;
    private List<MessageDTO> messages;
    private Object previewOntology;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
