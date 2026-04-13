package com.ontology.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("action_rule_params")
public class ActionRuleParam {
    
    @TableId(type = IdType.INPUT)
    private String id;
    
    private String actionRuleId;
    
    private String paramName;
    
    private String paramValue;
    
    private Integer sortOrder;
}
