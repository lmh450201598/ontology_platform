package com.ontology.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ontology.entity.LinkType;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface LinkTypeMapper extends BaseMapper<LinkType> {
    
    @Select("SELECT * FROM link_types ORDER BY name")
    List<LinkType> selectAllOrdered();
    
    @Select("SELECT * FROM link_types WHERE industry_id = #{industryId} ORDER BY name")
    List<LinkType> selectByIndustryId(@Param("industryId") String industryId);
}
