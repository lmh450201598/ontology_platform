package com.ontology.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("ontology_rule_params")
public class OntologyRuleParam {
    
    @TableId(type = IdType.INPUT)
    private String id;
    
    private String ruleId;
    
    private String paramDirection;
    
    private String paramName;
    
    private String paramType;
    
    private Integer isRequired;
    
    private String description;
    
    private Integer sortOrder;
}
