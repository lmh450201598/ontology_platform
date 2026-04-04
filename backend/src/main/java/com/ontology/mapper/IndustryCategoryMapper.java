package com.ontology.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ontology.entity.IndustryCategory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface IndustryCategoryMapper extends BaseMapper<IndustryCategory> {
    
    @Select("SELECT * FROM industry_categories ORDER BY level, sort_order")
    List<IndustryCategory> selectAllOrdered();
}
