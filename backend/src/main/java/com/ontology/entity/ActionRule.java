package com.ontology.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("action_rules")
public class ActionRule {
    
    @TableId(type = IdType.INPUT)
    private String id;
    
    private String actionTypeId;
    
    private String type;
    
    private String description;
}
