package com.ontology.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ontology.entity.OntologyRule;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface OntologyRuleMapper extends BaseMapper<OntologyRule> {
    
    @Select("SELECT * FROM ontology_rules ORDER BY created_at DESC")
    List<OntologyRule> selectAllOrdered();
    
    @Select("SELECT * FROM ontology_rules WHERE rule_category = #{category} ORDER BY created_at DESC")
    List<OntologyRule> selectByCategory(@Param("category") String category);
}
