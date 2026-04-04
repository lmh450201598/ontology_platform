package com.ontology.dto;

import lombok.Data;

import java.util.List;

@Data
public class ActionTypeDTO {
    private String id;
    private String name;
    private String description;
    private String targetObjectId;
    private String industryId;
    private List<ActionParameterDTO> parameters;
    private List<ActionRuleDTO> rules;
}
