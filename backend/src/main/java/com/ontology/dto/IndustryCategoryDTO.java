package com.ontology.dto;

import lombok.Data;

import java.util.List;

@Data
public class IndustryCategoryDTO {
    private String id;
    private String name;
    private String code;
    private Integer level;
    private String parentId;
    private Integer sortOrder;
    private List<IndustryCategoryDTO> children;
}
