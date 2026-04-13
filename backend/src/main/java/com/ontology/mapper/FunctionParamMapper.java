package com.ontology.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ontology.entity.FunctionParam;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface FunctionParamMapper extends BaseMapper<FunctionParam> {
    
    @Select("SELECT * FROM function_params WHERE function_id = #{functionId} ORDER BY sort_order")
    List<FunctionParam> selectByFunctionId(@Param("functionId") String functionId);
    
    @Select("SELECT * FROM function_params WHERE function_id = #{functionId} AND param_direction = #{direction} ORDER BY sort_order")
    List<FunctionParam> selectByFunctionIdAndDirection(@Param("functionId") String functionId, @Param("direction") String direction);
    
    @Select("DELETE FROM function_params WHERE function_id = #{functionId}")
    void deleteByFunctionId(@Param("functionId") String functionId);
}
