package com.ontology.controller;

import com.ontology.service.PriceTransmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analysis")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PriceTransmissionController {
    
    private final PriceTransmissionService priceTransmissionService;
    
    @PostMapping("/price-transmission")
    public Map<String, Object> calculatePriceTransmission(@RequestBody Map<String, Object> request) {
        String instanceId = (String) request.get("instanceId");
        
        // 处理 depth 参数，支持字符串和数字类型
        Integer depth = 3;
        Object depthObj = request.get("depth");
        if (depthObj != null) {
            if (depthObj instanceof Number) {
                depth = ((Number) depthObj).intValue();
            } else if (depthObj instanceof String) {
                try {
                    depth = Integer.parseInt((String) depthObj);
                } catch (NumberFormatException e) {
                    return Map.of("success", false, "error", "depth must be a valid number");
                }
            }
        }
        
        // 处理 latestPrice 参数，支持字符串和数字类型
        Double latestPrice = null;
        Object priceObj = request.get("latestPrice");
        if (priceObj != null) {
            if (priceObj instanceof Number) {
                latestPrice = ((Number) priceObj).doubleValue();
            } else if (priceObj instanceof String) {
                try {
                    latestPrice = Double.parseDouble((String) priceObj);
                } catch (NumberFormatException e) {
                    return Map.of("success", false, "error", "latestPrice must be a valid number");
                }
            }
        }
        
        if (instanceId == null || instanceId.isEmpty()) {
            return Map.of("success", false, "error", "instanceId is required");
        }
        if (latestPrice == null || latestPrice <= 0) {
            return Map.of("success", false, "error", "latestPrice must be positive");
        }
        if (depth < 1 || depth > 5) {
            return Map.of("success", false, "error", "depth must be between 1 and 5");
        }
        
        return priceTransmissionService.calculatePriceTransmission(instanceId, latestPrice, depth);
    }
}
