package com.ontology.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ontology.entity.ActionRuleParam;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface ActionRuleParamMapper extends BaseMapper<ActionRuleParam> {
    
    @Select("SELECT * FROM action_rule_params WHERE action_rule_id = #{actionRuleId} ORDER BY sort_order")
    List<ActionRuleParam> selectByActionRuleId(@Param("actionRuleId") String actionRuleId);
    
    @Select("DELETE FROM action_rule_params WHERE action_rule_id IN (SELECT id FROM action_rules WHERE action_type_id = #{actionTypeId})")
    void deleteByActionTypeId(@Param("actionTypeId") String actionTypeId);
}
