package com.ontology.dto;

import lombok.Data;

import java.util.List;

@Data
public class PropertyDTO {
    private String id;
    private String name;
    private String type;
    private String description;
    private Boolean isPrimaryKey;
    private String baseColumn;
    private List<String> typeClasses;
}
