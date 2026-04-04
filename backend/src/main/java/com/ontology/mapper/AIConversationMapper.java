package com.ontology.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ontology.entity.AIConversation;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface AIConversationMapper extends BaseMapper<AIConversation> {
    
    @Select("SELECT id, title, created_at, updated_at FROM ai_conversations ORDER BY updated_at DESC")
    List<AIConversation> selectListOrdered();
}
