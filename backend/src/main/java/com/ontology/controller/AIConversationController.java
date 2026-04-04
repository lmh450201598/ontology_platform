package com.ontology.controller;

import com.ontology.entity.AIConversation;
import com.ontology.mapper.AIConversationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AIConversationController {
    
    private final AIConversationMapper conversationMapper;
    
    @GetMapping("/conversations")
    public Map<String, Object> list() {
        List<AIConversation> conversations = conversationMapper.selectListOrdered();
        return Map.of("conversations", conversations);
    }
    
    @GetMapping("/conversations/{id}")
    public Map<String, Object> getById(@PathVariable String id) {
        AIConversation conversation = conversationMapper.selectById(id);
        if (conversation == null) {
            throw new RuntimeException("Conversation not found");
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("id", conversation.getId());
        result.put("title", conversation.getTitle());
        result.put("created_at", conversation.getCreatedAt());
        result.put("updated_at", conversation.getUpdatedAt());
        result.put("messages", parseJson(conversation.getMessages()));
        result.put("preview_ontology", parseJson(conversation.getPreviewOntology()));
        
        return result;
    }
    
    @PostMapping("/conversations")
    public Map<String, Object> create(@RequestBody Map<String, Object> data) {
        String title = (String) data.getOrDefault("title", "新对话");
        String id = "conv_" + UUID.randomUUID().toString().substring(0, 8);
        
        AIConversation conversation = new AIConversation();
        conversation.setId(id);
        conversation.setTitle(title);
        conversation.setMessages("[]");
        conversation.setPreviewOntology(null);
        conversation.setCreatedAt(LocalDateTime.now());
        conversation.setUpdatedAt(LocalDateTime.now());
        
        conversationMapper.insert(conversation);
        
        Map<String, Object> result = new HashMap<>();
        result.put("id", conversation.getId());
        result.put("title", conversation.getTitle());
        result.put("created_at", conversation.getCreatedAt());
        result.put("updated_at", conversation.getUpdatedAt());
        
        return result;
    }
    
    @PutMapping("/conversations/{id}")
    public Map<String, Object> update(@PathVariable String id, @RequestBody Map<String, Object> data) {
        AIConversation conversation = conversationMapper.selectById(id);
        if (conversation == null) {
            throw new RuntimeException("Conversation not found");
        }
        
        if (data.containsKey("title")) {
            conversation.setTitle((String) data.get("title"));
        }
        
        if (data.containsKey("messages")) {
            Object messages = data.get("messages");
            if (messages instanceof List) {
                conversation.setMessages(toJson(messages));
            } else {
                conversation.setMessages((String) messages);
            }
        }
        
        if (data.containsKey("preview_ontology")) {
            Object ontology = data.get("preview_ontology");
            if (ontology != null) {
                conversation.setPreviewOntology(toJson(ontology));
            } else {
                conversation.setPreviewOntology(null);
            }
        }
        
        conversation.setUpdatedAt(LocalDateTime.now());
        conversationMapper.updateById(conversation);
        
        return Map.of("success", true);
    }
    
    @DeleteMapping("/conversations/{id}")
    public Map<String, Object> delete(@PathVariable String id) {
        conversationMapper.deleteById(id);
        return Map.of("success", true);
    }
    
    private Object parseJson(String json) {
        if (json == null || json.isEmpty()) {
            return null;
        }
        try {
            // Simple JSON parsing - in production use Jackson ObjectMapper
            if (json.startsWith("[")) {
                return new java.util.ArrayList<>();
            } else if (json.startsWith("{")) {
                return new HashMap<>();
            }
            return json;
        } catch (Exception e) {
            return json;
        }
    }
    
    private String toJson(Object obj) {
        if (obj == null) {
            return null;
        }
        // Simple JSON serialization - in production use Jackson ObjectMapper
        return obj.toString();
    }
}
