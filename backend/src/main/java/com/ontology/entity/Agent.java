package com.ontology.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("agents")
public class Agent {
    
    @TableId(type = IdType.INPUT)
    private String id;
    
    private String name;
    
    private String description;
    
    private String targetCompany;
    
    private String targetIndustry;
    
    private String analysisFocus;
    
    private Integer scheduleMinutes;
    
    private Integer isActive;
    
    private LocalDateTime lastRunAt;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}
