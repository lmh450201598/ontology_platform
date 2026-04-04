package com.ontology.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ontology.entity.ActionRule;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface ActionRuleMapper extends BaseMapper<ActionRule> {
    
    @Select("SELECT * FROM action_rules WHERE action_type_id = #{actionTypeId} ORDER BY id")
    List<ActionRule> selectByActionTypeId(@Param("actionTypeId") String actionTypeId);
}
