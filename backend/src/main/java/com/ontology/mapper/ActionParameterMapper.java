package com.ontology.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ontology.entity.ActionParameter;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface ActionParameterMapper extends BaseMapper<ActionParameter> {
    
    @Select("SELECT * FROM action_parameters WHERE action_type_id = #{actionTypeId} ORDER BY sort_order")
    List<ActionParameter> selectByActionTypeId(@Param("actionTypeId") String actionTypeId);
}
