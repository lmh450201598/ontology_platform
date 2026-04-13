package com.ontology.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ontology.entity.OntologyRuleParam;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Delete;

import java.util.List;

@Mapper
public interface OntologyRuleParamMapper extends BaseMapper<OntologyRuleParam> {
    
    @Select("SELECT * FROM ontology_rule_params WHERE rule_id = #{ruleId} AND param_direction = 'INPUT' ORDER BY sort_order")
    List<OntologyRuleParam> selectInputParamsByRuleId(@Param("ruleId") String ruleId);
    
    @Select("SELECT * FROM ontology_rule_params WHERE rule_id = #{ruleId} AND param_direction = 'OUTPUT' ORDER BY sort_order")
    List<OntologyRuleParam> selectOutputParamsByRuleId(@Param("ruleId") String ruleId);
    
    @Select("SELECT * FROM ontology_rule_params WHERE rule_id = #{ruleId} ORDER BY param_direction, sort_order")
    List<OntologyRuleParam> selectByRuleId(@Param("ruleId") String ruleId);
    
    @Delete("DELETE FROM ontology_rule_params WHERE rule_id = #{ruleId}")
    int deleteByRuleId(@Param("ruleId") String ruleId);
}
