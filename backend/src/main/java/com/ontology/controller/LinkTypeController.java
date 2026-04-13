package com.ontology.controller;

import com.ontology.entity.LinkType;
import com.ontology.mapper.LinkTypeMapper;
import com.ontology.service.OntologyService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/link-types")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LinkTypeController {

    private final LinkTypeMapper linkTypeMapper;
    private final OntologyService ontologyService;

    @PostMapping
    public Map<String, Object> create(@RequestBody LinkType linkType) {
        linkType.setStatus("pending"); // 新建链接类型默认待审核
        linkTypeMapper.insert(linkType);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("data", ontologyService.buildOntologyData());
        return result;
    }

    @PutMapping("/{id}")
    public Map<String, Object> update(@PathVariable String id, @RequestBody LinkType linkType) {
        linkType.setId(id);
        linkTypeMapper.updateById(linkType);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("data", ontologyService.buildOntologyData());
        return result;
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> delete(@PathVariable String id) {
        linkTypeMapper.deleteById(id);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("data", ontologyService.buildOntologyData());
        return result;
    }
}
