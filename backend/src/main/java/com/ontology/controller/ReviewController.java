package com.ontology.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.ontology.entity.LinkType;
import com.ontology.entity.ObjectType;
import com.ontology.entity.Property;
import com.ontology.mapper.LinkTypeMapper;
import com.ontology.mapper.ObjectTypeMapper;
import com.ontology.mapper.PropertyMapper;
import com.ontology.service.OntologyService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/review")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ObjectTypeMapper objectTypeMapper;
    private final LinkTypeMapper linkTypeMapper;
    private final PropertyMapper propertyMapper;
    private final OntologyService ontologyService;

    /**
     * 获取待审核列表（分页）
     */
    @GetMapping("/pending")
    public Map<String, Object> getPendingList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize) {
        
        Map<String, Object> result = new HashMap<>();
        
        // 查询待审核对象类型
        QueryWrapper<ObjectType> otWrapper = new QueryWrapper<>();
        otWrapper.eq("status", "pending").orderByDesc("created_at");
        IPage<ObjectType> otPage = objectTypeMapper.selectPage(new Page<>(page, pageSize), otWrapper);
        
        // 查询待审核链接类型
        QueryWrapper<LinkType> ltWrapper = new QueryWrapper<>();
        ltWrapper.eq("status", "pending").orderByDesc("created_at");
        IPage<LinkType> ltPage = linkTypeMapper.selectPage(new Page<>(page, pageSize), ltWrapper);
        
        // 统计总数
        Long totalObjectTypes = objectTypeMapper.selectCount(
            new QueryWrapper<ObjectType>().eq("status", "pending")
        );
        Long totalLinkTypes = linkTypeMapper.selectCount(
            new QueryWrapper<LinkType>().eq("status", "pending")
        );
        
        result.put("objectTypes", otPage.getRecords());
        result.put("linkTypes", ltPage.getRecords());
        result.put("totalObjectTypes", totalObjectTypes);
        result.put("totalLinkTypes", totalLinkTypes);
        result.put("total", totalObjectTypes + totalLinkTypes);
        result.put("page", page);
        result.put("pageSize", pageSize);
        
        return result;
    }

    /**
     * 审核通过对象类型
     */
    @PostMapping("/object-types/{id}/approve")
    public Map<String, Object> approveObjectType(@PathVariable String id) {
        ObjectType objectType = objectTypeMapper.selectById(id);
        if (objectType == null) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("error", "Object type not found");
            return result;
        }
        
        objectType.setStatus("active");
        objectTypeMapper.updateById(objectType);
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "对象类型审核通过");
        result.put("data", ontologyService.buildOntologyData());
        return result;
    }

    /**
     * 审核不通过并删除对象类型
     */
    @PostMapping("/object-types/{id}/reject")
    public Map<String, Object> rejectObjectType(@PathVariable String id) {
        ObjectType objectType = objectTypeMapper.selectById(id);
        if (objectType == null) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("error", "Object type not found");
            return result;
        }
        
        // 删除关联属性
        QueryWrapper<Property> propWrapper = new QueryWrapper<>();
        propWrapper.eq("object_type_id", id);
        propertyMapper.delete(propWrapper);
        
        // 删除对象类型
        objectTypeMapper.deleteById(id);
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "对象类型已删除");
        result.put("data", ontologyService.buildOntologyData());
        return result;
    }

    /**
     * 审核通过链接类型
     */
    @PostMapping("/link-types/{id}/approve")
    public Map<String, Object> approveLinkType(@PathVariable String id) {
        LinkType linkType = linkTypeMapper.selectById(id);
        if (linkType == null) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("error", "Link type not found");
            return result;
        }
        
        linkType.setStatus("active");
        linkTypeMapper.updateById(linkType);
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "链接类型审核通过");
        result.put("data", ontologyService.buildOntologyData());
        return result;
    }

    /**
     * 审核不通过并删除链接类型
     */
    @PostMapping("/link-types/{id}/reject")
    public Map<String, Object> rejectLinkType(@PathVariable String id) {
        LinkType linkType = linkTypeMapper.selectById(id);
        if (linkType == null) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("error", "Link type not found");
            return result;
        }
        
        // 删除链接类型
        linkTypeMapper.deleteById(id);
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "链接类型已删除");
        result.put("data", ontologyService.buildOntologyData());
        return result;
    }

    /**
     * 获取待审核数量
     */
    @GetMapping("/count")
    public Map<String, Object> getPendingCount() {
        Long objectTypes = objectTypeMapper.selectCount(
            new QueryWrapper<ObjectType>().eq("status", "pending")
        );
        Long linkTypes = linkTypeMapper.selectCount(
            new QueryWrapper<LinkType>().eq("status", "pending")
        );
        
        Map<String, Object> result = new HashMap<>();
        result.put("total", objectTypes + linkTypes);
        result.put("objectTypes", objectTypes);
        result.put("linkTypes", linkTypes);
        return result;
    }
}
