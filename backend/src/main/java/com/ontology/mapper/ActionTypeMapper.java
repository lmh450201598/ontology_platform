package com.ontology.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ontology.entity.ActionType;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface ActionTypeMapper extends BaseMapper<ActionType> {
    
    @Select("SELECT * FROM action_types ORDER BY name")
    List<ActionType> selectAllOrdered();
    
    @Select("SELECT * FROM action_types WHERE industry_id = #{industryId} ORDER BY name")
    List<ActionType> selectByIndustryId(@Param("industryId") String industryId);
}
