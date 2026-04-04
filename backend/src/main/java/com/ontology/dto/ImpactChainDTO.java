package com.ontology.dto;

import lombok.Data;

@Data
public class ImpactChainDTO {
    private String from;
    private String to;
    private String mechanism;
    private String intensity;
}
