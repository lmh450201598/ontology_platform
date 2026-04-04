package com.ontology.dto;

import lombok.Data;

import java.util.List;

@Data
public class ObjectTypeDTO {
    private String id;
    private String name;
    private String description;
    private String icon;
    private String backingDataset;
    private String industryId;
    private List<PropertyDTO> properties;
}
