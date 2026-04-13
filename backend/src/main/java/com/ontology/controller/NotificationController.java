package com.ontology.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.ontology.entity.Notification;
import com.ontology.mapper.NotificationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationMapper notificationMapper;

    /**
     * 获取通知列表
     */
    @GetMapping
    public Map<String, Object> list(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "20") Integer limit,
            @RequestParam(defaultValue = "0") Integer offset) {
        
        LambdaQueryWrapper<Notification> wrapper = new LambdaQueryWrapper<>();
        
        if (status != null && !status.isEmpty()) {
            wrapper.eq(Notification::getStatus, status);
        }
        
        wrapper.orderByDesc(Notification::getCreatedAt);
        
        Page<Notification> page = new Page<>(offset / limit + 1, limit);
        Page<Notification> result = notificationMapper.selectPage(page, wrapper);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("notifications", result.getRecords());
        response.put("total", result.getTotal());
        
        return response;
    }

    /**
     * 获取未读数量
     */
    @GetMapping("/unread-count")
    public Map<String, Object> getUnreadCount() {
        LambdaQueryWrapper<Notification> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Notification::getStatus, "UNREAD");
        
        Long count = notificationMapper.selectCount(wrapper);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("count", count);
        
        return response;
    }

    /**
     * 标记单条已读
     */
    @PutMapping("/{id}/read")
    public Map<String, Object> markAsRead(@PathVariable String id) {
        int rows = notificationMapper.markAsRead(id, LocalDateTime.now());
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", rows > 0);
        response.put("message", rows > 0 ? "标记成功" : "通知不存在");
        
        return response;
    }

    /**
     * 标记全部已读
     */
    @PutMapping("/read-all")
    public Map<String, Object> markAllAsRead() {
        int rows = notificationMapper.markAllAsRead(LocalDateTime.now());
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "已标记 " + rows + " 条通知为已读");
        
        return response;
    }

    /**
     * 创建通知（内部调用）
     */
    @PostMapping
    public Map<String, Object> create(@RequestBody Notification notification) {
        if (notification.getId() == null || notification.getId().isEmpty()) {
            notification.setId("notif_" + UUID.randomUUID().toString().substring(0, 8));
        }
        if (notification.getStatus() == null || notification.getStatus().isEmpty()) {
            notification.setStatus("UNREAD");
        }
        notification.setCreatedAt(LocalDateTime.now());
        
        notificationMapper.insert(notification);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("notification", notification);
        
        return response;
    }

    /**
     * 删除通知
     */
    @DeleteMapping("/{id}")
    public Map<String, Object> delete(@PathVariable String id) {
        int rows = notificationMapper.deleteById(id);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", rows > 0);
        response.put("message", rows > 0 ? "删除成功" : "通知不存在");
        
        return response;
    }
}
