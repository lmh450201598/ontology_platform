package com.ontology.dto;

import lombok.Data;

@Data
public class LinkTypeDTO {
    private String id;
    private String name;
    private String sourceObjectId;
    private String targetObjectId;
    private String cardinality;
    private String description;
    private String industryId;
}
