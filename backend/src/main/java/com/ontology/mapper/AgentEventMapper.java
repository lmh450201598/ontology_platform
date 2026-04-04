package com.ontology.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ontology.entity.AgentEvent;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface AgentEventMapper extends BaseMapper<AgentEvent> {
    
    @Select("SELECT * FROM agent_events WHERE agent_id = #{agentId} ORDER BY created_at DESC LIMIT 50")
    List<AgentEvent> selectByAgentId(@Param("agentId") String agentId);
}
