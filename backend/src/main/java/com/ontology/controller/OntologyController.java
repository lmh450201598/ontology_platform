package com.ontology.controller;

import com.ontology.service.OntologyService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OntologyController {
    
    private final OntologyService ontologyService;
    
    @GetMapping("/ontology")
    public Map<String, Object> getAll() {
        return ontologyService.buildOntologyData();
    }
}
