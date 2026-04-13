package com.ontology.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@TableName("action_rules")
public class ActionRule {
    
    @TableId(type = IdType.INPUT)
    private String id;
    
    private String actionTypeId;
    
    private String ruleType;
    
    private String ontologyRuleCategory;
    
    private String ontologyRuleId;
    
    private String functionTypeId;
    
    private Integer sortOrder;
    
    private LocalDateTime createdAt;
    
    @TableField(exist = false)
    private List<ActionRuleParam> params;
    
    // 关联查询字段
    @TableField(exist = false)
    private String ontologyRuleName;
    
    @TableField(exist = false)
    private String ontologyRuleDescription;
    
    @TableField(exist = false)
    private String functionTypeName;
    
    @TableField(exist = false)
    private String functionTypeCode;
}
