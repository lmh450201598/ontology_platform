package com.ontology.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("action_effects")
public class ActionEffect {
    
    @TableId(type = IdType.INPUT)
    private String id;
    
    private String actionTypeId;
    
    private String effectType;
    
    private String content;
    
    private Integer isEnabled;
    
    private Integer sortOrder;
}
