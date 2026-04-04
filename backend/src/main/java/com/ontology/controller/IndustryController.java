package com.ontology.controller;

import com.ontology.entity.IndustryCategory;
import com.ontology.service.IndustryService;
import com.ontology.service.OntologyService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/industries")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class IndustryController {
    
    private final IndustryService industryService;
    private final OntologyService ontologyService;
    
    @GetMapping
    public Map<String, Object> list() {
        List<IndustryCategory> industries = industryService.listAll();
        Map<String, Object> result = new HashMap<>();
        result.put("industries", industries);
        return result;
    }
    
    @GetMapping("/tree")
    public Map<String, Object> tree() {
        List<Map<String, Object>> tree = industryService.buildTree();
        Map<String, Object> result = new HashMap<>();
        result.put("tree", tree);
        return result;
    }
    
    @GetMapping("/{id}/ontology")
    public Map<String, Object> getOntology(@PathVariable String id) {
        return ontologyService.getIndustryOntology(id);
    }
}
