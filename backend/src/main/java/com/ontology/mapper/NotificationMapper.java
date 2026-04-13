package com.ontology.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ontology.entity.Notification;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

import java.time.LocalDateTime;

@Mapper
public interface NotificationMapper extends BaseMapper<Notification> {
    
    @Update("UPDATE notifications SET status = 'READ', read_at = #{readAt} WHERE id = #{id}")
    int markAsRead(@Param("id") String id, @Param("readAt") LocalDateTime readAt);
    
    @Update("UPDATE notifications SET status = 'READ', read_at = #{readAt} WHERE status = 'UNREAD'")
    int markAllAsRead(@Param("readAt") LocalDateTime readAt);
}
