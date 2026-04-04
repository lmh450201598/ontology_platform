package com.ontology.dto;

import lombok.Data;

@Data
public class ActionParameterDTO {
    private String id;
    private String name;
    private String type;
    private String description;
    private Boolean required;
    private Integer sortOrder;
}
