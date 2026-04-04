package com.ontology.controller;

import com.ontology.entity.Agent;
import com.ontology.entity.AgentEvent;
import com.ontology.entity.AgentAnalysis;
import com.ontology.mapper.AgentMapper;
import com.ontology.mapper.AgentEventMapper;
import com.ontology.mapper.AgentAnalysisMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/research-agents")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ResearchAgentController {
    
    private final AgentMapper agentMapper;
    private final AgentEventMapper agentEventMapper;
    private final AgentAnalysisMapper agentAnalysisMapper;
    
    @GetMapping
    public Map<String, Object> list() {
        List<Agent> agents = agentMapper.selectAllOrdered();
        return Map.of("agents", agents);
    }
    
    @GetMapping("/{id}")
    public Map<String, Object> getById(@PathVariable String id) {
        Agent agent = agentMapper.selectById(id);
        if (agent == null) {
            throw new RuntimeException("Agent not found");
        }
        return Map.of("agent", agent);
    }
    
    @PostMapping
    public Map<String, Object> create(@RequestBody Map<String, Object> data) {
        String name = (String) data.get("name");
        String targetCompany = (String) data.get("targetCompany");
        String targetIndustry = (String) data.get("targetIndustry");
        
        if (name == null || targetCompany == null || targetIndustry == null) {
            throw new RuntimeException("name, targetCompany, targetIndustry are required");
        }
        
        Agent agent = new Agent();
        agent.setId("agent_" + UUID.randomUUID().toString().substring(0, 8));
        agent.setName(name);
        agent.setDescription((String) data.getOrDefault("description", ""));
        agent.setTargetCompany(targetCompany);
        agent.setTargetIndustry(targetIndustry);
        agent.setAnalysisFocus((String) data.getOrDefault("analysisFocus", ""));
        agent.setScheduleMinutes((Integer) data.getOrDefault("scheduleMinutes", 0));
        agent.setIsActive(0);
        agent.setCreatedAt(LocalDateTime.now());
        agent.setUpdatedAt(LocalDateTime.now());
        
        agentMapper.insert(agent);
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("agent", agent);
        return result;
    }
    
    @PutMapping("/{id}")
    public Map<String, Object> update(@PathVariable String id, @RequestBody Map<String, Object> data) {
        Agent agent = agentMapper.selectById(id);
        if (agent == null) {
            throw new RuntimeException("Agent not found");
        }
        
        if (data.containsKey("is_active")) {
            Object isActive = data.get("is_active");
            if (isActive instanceof Boolean) {
                agent.setIsActive((Boolean) isActive ? 1 : 0);
            } else if (isActive instanceof Number) {
                agent.setIsActive(((Number) isActive).intValue());
            }
        }
        
        if (data.containsKey("schedule_minutes")) {
            agent.setScheduleMinutes((Integer) data.get("schedule_minutes"));
        }
        
        agent.setUpdatedAt(LocalDateTime.now());
        agentMapper.updateById(agent);
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("agent", agent);
        return result;
    }
    
    @DeleteMapping("/{id}")
    public Map<String, Object> delete(@PathVariable String id) {
        agentMapper.deleteById(id);
        return Map.of("success", true);
    }
    
    @GetMapping("/{id}/events")
    public Map<String, Object> getEvents(@PathVariable String id) {
        List<AgentEvent> events = agentEventMapper.selectByAgentId(id);
        // Parse JSON fields
        for (AgentEvent event : events) {
            if (event.getRelatedEntities() == null) {
                event.setRelatedEntities("[]");
            }
        }
        return Map.of("events", events);
    }
    
    @PostMapping("/{id}/events")
    public Map<String, Object> createEvent(@PathVariable String id, @RequestBody Map<String, Object> data) {
        AgentEvent event = new AgentEvent();
        event.setId((String) data.get("id"));
        event.setAgentId(id);
        event.setTitle((String) data.get("title"));
        event.setSummary((String) data.get("summary"));
        event.setSource((String) data.get("source"));
        event.setSourceUrl((String) data.get("source_url"));
        event.setEventDate((String) data.get("event_date"));
        event.setImpactLevel((String) data.get("impact_level"));
        event.setRelatedEntities((String) data.get("related_entities"));
        event.setCreatedAt(LocalDateTime.now());
        
        agentEventMapper.insert(event);
        return Map.of("success", true, "event", event);
    }
    
    @GetMapping("/{id}/analyses")
    public Map<String, Object> getAnalyses(@PathVariable String id) {
        List<AgentAnalysis> analyses = agentAnalysisMapper.selectByAgentId(id);
        return Map.of("analyses", analyses);
    }
    
    @PostMapping("/{id}/analyses")
    public Map<String, Object> createAnalysis(@PathVariable String id, @RequestBody Map<String, Object> data) {
        AgentAnalysis analysis = new AgentAnalysis();
        analysis.setId((String) data.get("id"));
        analysis.setAgentId(id);
        analysis.setEventId((String) data.get("event_id"));
        analysis.setTitle((String) data.get("title"));
        analysis.setContent((String) data.get("content"));
        analysis.setKeyFindings((String) data.get("key_findings"));
        analysis.setImpactChain((String) data.get("impact_chain"));
        analysis.setRecommendation((String) data.get("recommendation"));
        analysis.setCreatedAt(LocalDateTime.now());
        
        agentAnalysisMapper.insert(analysis);
        return Map.of("success", true, "analysis", analysis);
    }
}
