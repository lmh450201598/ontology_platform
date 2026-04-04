package com.ontology.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ontology.entity.Property;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface PropertyMapper extends BaseMapper<Property> {
    
    @Select("SELECT * FROM properties WHERE object_type_id = #{objectTypeId} ORDER BY sort_order")
    List<Property> selectByObjectTypeId(@Param("objectTypeId") String objectTypeId);
}
