package com.ontology.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ontology.entity.FunctionType;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface FunctionTypeMapper extends BaseMapper<FunctionType> {
    
    @Select("SELECT * FROM function_type ORDER BY created_at DESC")
    List<FunctionType> selectAllOrdered();
    
    @Select("SELECT * FROM function_type WHERE id = #{id}")
    FunctionType selectById(@Param("id") String id);
}
