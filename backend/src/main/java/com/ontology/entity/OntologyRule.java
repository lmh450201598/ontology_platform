package com.ontology.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@TableName("ontology_rules")
public class OntologyRule {
    
    @TableId(type = IdType.INPUT)
    private String id;
    
    private String ruleCategory;
    
    private String functionName;
    
    private String interfaceType;
    
    private String requestMethod;
    
    private String interfaceUrl;
    
    private String functionDescription;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    @TableField(exist = false)
    private List<OntologyRuleParam> inputParams;
    
    @TableField(exist = false)
    private List<OntologyRuleParam> outputParams;
}
