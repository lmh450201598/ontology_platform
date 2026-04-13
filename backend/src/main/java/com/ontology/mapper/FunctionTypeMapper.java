package com.ontology.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ontology.entity.FunctionType;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface FunctionTypeMapper extends BaseMapper<FunctionType> {
    
    @Select("SELECT * FROM function_types WHERE status = 'ACTIVE' ORDER BY created_at DESC")
    List<FunctionType> selectAllActive();
    
    @Select("SELECT * FROM function_types WHERE category = #{category} AND status = 'ACTIVE' ORDER BY created_at DESC")
    List<FunctionType> selectByCategory(@Param("category") String category);
    
    @Select("SELECT * FROM function_types WHERE code = #{code} AND status = 'ACTIVE' LIMIT 1")
    FunctionType selectByCode(@Param("code") String code);
}
