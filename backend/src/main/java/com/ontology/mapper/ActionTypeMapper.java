package com.ontology.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ontology.entity.ActionType;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface ActionTypeMapper extends BaseMapper<ActionType> {
    
    @Select("SELECT * FROM action_types WHERE status = 'ACTIVE' ORDER BY created_at DESC")
    List<ActionType> selectAllActive();
    
    @Select("SELECT * FROM action_types WHERE status = 'ACTIVE' AND display_name LIKE #{keyword} ORDER BY created_at DESC")
    List<ActionType> searchByName(@Param("keyword") String keyword);
}
