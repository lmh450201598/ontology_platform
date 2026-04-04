package com.ontology.dto;

import lombok.Data;

import java.util.List;

@Data
public class OntologyDataDTO {
    private List<ObjectTypeDTO> objectTypes;
    private List<LinkTypeDTO> linkTypes;
    private List<ActionTypeDTO> actionTypes;
}
