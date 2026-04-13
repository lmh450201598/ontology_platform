package com.ontology.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ontology.entity.ActionEffect;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface ActionEffectMapper extends BaseMapper<ActionEffect> {
    
    @Select("SELECT * FROM action_effects WHERE action_type_id = #{actionTypeId} ORDER BY sort_order")
    List<ActionEffect> selectByActionTypeId(@Param("actionTypeId") String actionTypeId);
    
    @Select("DELETE FROM action_effects WHERE action_type_id = #{actionTypeId}")
    void deleteByActionTypeId(@Param("actionTypeId") String actionTypeId);
}
