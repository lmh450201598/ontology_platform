package com.ontology.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ontology.entity.ObjectType;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface ObjectTypeMapper extends BaseMapper<ObjectType> {
    
    @Select("SELECT * FROM object_types ORDER BY name")
    List<ObjectType> selectAllOrdered();
    
    @Select("SELECT * FROM object_types WHERE industry_id = #{industryId} ORDER BY name")
    List<ObjectType> selectByIndustryId(@Param("industryId") String industryId);
}
