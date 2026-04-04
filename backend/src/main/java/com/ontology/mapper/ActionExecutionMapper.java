package com.ontology.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ontology.entity.ActionExecution;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface ActionExecutionMapper extends BaseMapper<ActionExecution> {
    
    @Select("SELECT * FROM action_executions WHERE action_type_id = #{actionTypeId} ORDER BY created_at DESC")
    List<ActionExecution> selectByActionTypeId(@Param("actionTypeId") String actionTypeId);
    
    @Select("SELECT * FROM action_executions ORDER BY created_at DESC LIMIT 100")
    List<ActionExecution> selectAllOrdered();
}
