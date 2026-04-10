/*
 Navicat Premium Dump SQL

 Source Server         : mac本地
 Source Server Type    : MySQL
 Source Server Version : 90600 (9.6.0)
 Source Host           : localhost:3306
 Source Schema         : ontology

 Target Server Type    : MySQL
 Target Server Version : 90600 (9.6.0)
 File Encoding         : 65001

 Date: 09/04/2026 14:17:24
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for action_executions
-- ----------------------------
DROP TABLE IF EXISTS `action_executions`;
CREATE TABLE `action_executions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action_type_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_object_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parameters` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `validation_errors` text COLLATE utf8mb4_unicode_ci,
  `side_effects` text COLLATE utf8mb4_unicode_ci,
  `result` text COLLATE utf8mb4_unicode_ci,
  `executed_by` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'system',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `action_type_id` (`action_type_id`),
  CONSTRAINT `action_executions_ibfk_1` FOREIGN KEY (`action_type_id`) REFERENCES `action_types` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of action_executions
-- ----------------------------
BEGIN;
INSERT INTO `action_executions` (`id`, `action_type_id`, `target_object_id`, `parameters`, `status`, `validation_errors`, `side_effects`, `result`, `executed_by`, `created_at`, `completed_at`) VALUES ('exec_a9e2b99f', 'act_vehicle_price', 'new_energy_vehicle', '{变化（增加or减少）=增加, 比例（%）=10%}', 'completed', NULL, NULL, '{actionTypeId=act_vehicle_price, actionTypeName=碳酸锂价格变化触发整车价格调整, executedAt=2026-04-09T09:39:50.966601, parameters={变化（增加or减少）=增加, 比例（%）=10%}}', 'user', '2026-04-09 09:39:51', '2026-04-09 09:39:51');
INSERT INTO `action_executions` (`id`, `action_type_id`, `target_object_id`, `parameters`, `status`, `validation_errors`, `side_effects`, `result`, `executed_by`, `created_at`, `completed_at`) VALUES ('exec_eb88859d', 'act_vehicle_price', 'new_energy_vehicle', '{变化（增加or减少）=增加, 比例（%）=10%}', 'completed', NULL, NULL, '{actionTypeId=act_vehicle_price, actionTypeName=碳酸锂价格变化触发整车价格调整, executedAt=2026-04-09T09:29:29.732140, parameters={变化（增加or减少）=增加, 比例（%）=10%}}', 'user', '2026-04-09 09:29:30', '2026-04-09 09:29:30');
COMMIT;

-- ----------------------------
-- Table structure for action_parameters
-- ----------------------------
DROP TABLE IF EXISTS `action_parameters`;
CREATE TABLE `action_parameters` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action_type_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'string',
  `required` tinyint NOT NULL DEFAULT '0',
  `sort_order` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `action_type_id` (`action_type_id`),
  CONSTRAINT `action_parameters_ibfk_1` FOREIGN KEY (`action_type_id`) REFERENCES `action_types` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of action_parameters
-- ----------------------------
BEGIN;
INSERT INTO `action_parameters` (`id`, `action_type_id`, `name`, `type`, `required`, `sort_order`) VALUES ('act_vehicle_price_p_0', 'act_vehicle_price', '变化（增加or减少）', 'string', 0, 0);
INSERT INTO `action_parameters` (`id`, `action_type_id`, `name`, `type`, `required`, `sort_order`) VALUES ('act_vehicle_price_p_1', 'act_vehicle_price', '比例（%）', 'string', 0, 1);
COMMIT;

-- ----------------------------
-- Table structure for action_rules
-- ----------------------------
DROP TABLE IF EXISTS `action_rules`;
CREATE TABLE `action_rules` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action_type_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `action_type_id` (`action_type_id`),
  CONSTRAINT `action_rules_ibfk_1` FOREIGN KEY (`action_type_id`) REFERENCES `action_types` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of action_rules
-- ----------------------------
BEGIN;
INSERT INTO `action_rules` (`id`, `action_type_id`, `type`, `description`) VALUES ('act_vehicle_price_r_0', 'act_vehicle_price', 'webhook', '在页面显示出价格调整');
COMMIT;

-- ----------------------------
-- Table structure for action_types
-- ----------------------------
DROP TABLE IF EXISTS `action_types`;
CREATE TABLE `action_types` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `target_object_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `industry_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of action_types
-- ----------------------------
BEGIN;
INSERT INTO `action_types` (`id`, `name`, `description`, `target_object_id`, `industry_id`, `created_at`, `updated_at`) VALUES ('act_vehicle_price', '碳酸锂价格变化触发整车价格调整', '当碳酸锂价格变化之后，通过本体图谱找到与碳酸锂有关系的对象类型，并将所有对象类型对应实例的价格属性值予以同比例的调整', 'new_energy_vehicle', NULL, '2026-04-09 09:29:12', '2026-04-09 09:29:12');
COMMIT;

-- ----------------------------
-- Table structure for agent_analyses
-- ----------------------------
DROP TABLE IF EXISTS `agent_analyses`;
CREATE TABLE `agent_analyses` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `agent_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci,
  `key_findings` text COLLATE utf8mb4_unicode_ci,
  `impact_chain` text COLLATE utf8mb4_unicode_ci,
  `recommendation` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `agent_id` (`agent_id`),
  CONSTRAINT `agent_analyses_ibfk_1` FOREIGN KEY (`agent_id`) REFERENCES `agents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of agent_analyses
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for agent_events
-- ----------------------------
DROP TABLE IF EXISTS `agent_events`;
CREATE TABLE `agent_events` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `agent_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `summary` text COLLATE utf8mb4_unicode_ci,
  `source` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `source_url` text COLLATE utf8mb4_unicode_ci,
  `event_date` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `impact_level` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'medium',
  `related_entities` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `agent_id` (`agent_id`),
  CONSTRAINT `agent_events_ibfk_1` FOREIGN KEY (`agent_id`) REFERENCES `agents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of agent_events
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for agents
-- ----------------------------
DROP TABLE IF EXISTS `agents`;
CREATE TABLE `agents` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `target_company` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `target_industry` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `analysis_focus` text COLLATE utf8mb4_unicode_ci,
  `schedule_minutes` int NOT NULL DEFAULT '0',
  `is_active` tinyint NOT NULL DEFAULT '0',
  `last_run_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of agents
-- ----------------------------
BEGIN;
INSERT INTO `agents` (`id`, `name`, `description`, `target_company`, `target_industry`, `analysis_focus`, `schedule_minutes`, `is_active`, `last_run_at`, `created_at`, `updated_at`) VALUES ('agent_995e16db', '中芯国际投研追踪', '', '中芯国际（688981.SH/SZ）', '半导体制造', '国产替代进口', 120, 0, NULL, '2026-04-04 11:13:44', '2026-04-04 11:13:44');
COMMIT;

-- ----------------------------
-- Table structure for ai_conversations
-- ----------------------------
DROP TABLE IF EXISTS `ai_conversations`;
CREATE TABLE `ai_conversations` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '新对话',
  `messages` text COLLATE utf8mb4_unicode_ci,
  `preview_ontology` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of ai_conversations
-- ----------------------------
BEGIN;
INSERT INTO `ai_conversations` (`id`, `title`, `messages`, `preview_ontology`, `created_at`, `updated_at`) VALUES ('conv_f73a7747', '请检查当前本体的所有实体，为每个实体补充到至少 8 个属性，…', '[{role=system, text=欢迎使用 AI Studio！我是你的本体建模助手。\n\n你可以：\n• 描述你的业务领域，我来生成完整的数据本体\n• 要求我添加、修改或删除实体和关系\n• 让我为已有本体添加语义层信息\n• 提问关于本体设计的最佳实践\n\n每次对话我都会在已有本体基础上迭代改进。}, {role=user, text=请检查当前本体的所有实体，为每个实体补充到至少 8 个属性，确保有主键、名称、描述、状态、创建时间和更新时间}, {role=assistant, text=好的，我已经分析了您提供的本体结构。当前本体描述了新能源汽车产业链，从上游的原材料（碳酸锂）到下游的整车，逻辑清晰。\n\n根据您的要求，我将为每个 **Object Type** 补充属性，确保每个实体至少包含：\n1.  **主键 (Primary Key)**\n2.  **名称 (Name)**\n3.  **描述 (Description)**\n4.  **状态 (Status)**\n5.  **创建时间 (Created At)**\n6.  **更新时间 (Updated At)**\n7.  **创建人 (Created By)**\n8.  **更新人 (Updated By)**\n\n同时，我会为每个属性指定其 `type`（如 `string`, `number`, `date`, `boolean`）并设置 `isPrimaryKey`。\n\n以下是修改后的本体 JSON。**新增或修改的属性已用注释 `// 新增属性` 标出**。\n\n```json\n{\n  \"linkTypes\": [\n    // ... (linkTypes 部分保持不变，因为本次任务是补充对象属性)\n    {\n      \"id\": \"lt_enterprise_lithium_carbonate_1775472273297\",\n      \"name\": \"企业生产原材料\",\n      \"sourceObjectId\": \"enterprise\",\n      \"targetObjectId\": \"lithium_carbonate\",\n      \"cardinality\": \"1:N\",\n      \"description\": \"一家矿业或化工企业可以生产并提供碳酸锂原材料。\",\n      \"industryId\": null,\n      \"sourceColumn\": null,\n      \"targetColumn\": null,\n      \"createdAt\": \"2026-04-06T18:44:33\",\n      \"updatedAt\": \"2026-04-06T18:44:33\"\n    },\n    // ... (其他 linkTypes)\n  ],\n  \"objectTypes\": [\n    {\n      \"id\": \"three_electric_system\",\n      \"name\": \"三电系统\",\n      \"description\": \"新能源汽车的核心动力总成，包含电池、电机、电控三大子系统。\",\n      \"icon\": \"Database\",\n      \"backingDataset\": \"three_electric_system\",\n      \"industryId\": null,\n      \"createdAt\": \"2026-04-05T15:18:08\",\n      \"updatedAt\": \"2026-04-05T15:18:08\",\n      \"properties\": [\n        {\n          \"id\": \"p_three_electric_system_id\",\n          \"objectTypeId\": \"three_electric_system\",\n          \"name\": \"三电系统ID\",\n          \"type\": \"string\",\n          \"description\": \"三电系统的唯一标识符\",\n          \"isPrimaryKey\": 1,\n          \"baseColumn\": \"system_id\",\n          \"typeClasses\": null,\n          \"sortOrder\": 0\n        },\n        {\n          \"id\": \"p_systemname_1775389485757\",\n          \"objectTypeId\": \"three_electric_system\",\n          \"name\": \"三电系统名称/型号\",\n          \"type\": \"string\",\n          \"description\": \"三电系统的商业型号或名称\",\n          \"isPrimaryKey\": 0,\n          \"baseColumn\": \"system_name\",\n          \"typeClasses\": null,\n          \"sortOrder\": 1\n        },\n        {\n          \"id\": \"p_system_description\",\n          \"objectTypeId\": \"three_electric_system\",\n          \"name\": \"系统描述\",\n          \"type\": \"string\",\n          \"description\": \"关于此三电系统的详细技术或功能描述\",\n          \"isPrimaryKey\": 0,\n          \"baseColumn\": \"description\",\n          \"typeClasses\": null,\n          \"sortOrder\": 2\n        },\n        {\n          \"id\": \"p_system_status\",\n          \"objectTypeId\": \"three_electric_system\",\n          \"name\": \"系统状态\",\n          \"type\": \"string\",\n          \"description\": \"系统当前状态，如：设计中、生产中、已量产、已停产\",\n          \"isPrimaryKey\": 0,\n          \"baseColumn\": \"status\",\n          \"typeClasses\": null,\n          \"sortOrder\": 3\n        },\n        {\n          \"id\": \"p_motorpower_1775389490556\",\n          \"objectTypeId\": \"three_electric_system\",\n          \"name\": \"电机功率（单位：kW）\",\n          \"type\": \"number\",\n          \"description\": \"系统所匹配或集成的驱动电机总功率\",\n          \"isPrimaryKey\": 0,\n          \"baseColumn\": \"motor_power\",\n          \"typeClasses\": null,\n          \"sortOrder\": 4\n        },\n        {\n          \"id\": \"p_voltageplatform_1775389493574\",\n          \"objectTypeId\": \"three_electric_system\",\n          \"name\": \"电压平台（如：400V、800V）\",\n          \"type\": \"string\",\n          \"description\": \"系统工作的电压平台标准\",\n          \"isPrimaryKey\": 0,\n          \"baseColumn\": \"voltage_platform\",\n          \"typeClasses\": null,\n          \"sortOrder\": 5\n        },\n        {\n          \"id\": \"p_chargepower_1775389495440\",\n          \"objectTypeId\": \"three_electric_system\",\n          \"name\": \"充电功率（单位：kW）\",\n          \"type\": \"number\",\n          \"description\": \"系统支持的最大充电功率\",\n          \"isPrimaryKey\": 0,\n          \"baseColumn\": \"charge_power\",\n          \"typeClasses\": null,\n          \"sortOrder\": 6\n        },\n        {\n          \"id\": \"p_isintelligent_1775389499606\",\n          \"objectTypeId\": \"three_electric_system\",\n          \"name\": \"是否具备智能能量管理功能\",\n          \"type\": \"boolean\",\n          \"description\": \"标识该系统是否包含智能能量回收、分配等高级功能\",\n          \"isPrimaryKey\": 0,\n          \"baseColumn\": \"is_intelligent\",\n          \"typeClasses\": null,\n          \"sortOrder\": 7\n        },\n        {\n          \"id\": \"p_productiondate_1775389503123\",\n          \"objectTypeId\": \"three_electric_system\",\n          \"name\": \"生产日期\",\n          \"type\": \"date\",\n          \"description\": \"该三电系统产品的生产日期\",\n          \"isPrimaryKey\": 0,\n          \"baseColumn\": \"production_date\",\n          \"typeClasses\": null,\n          \"sortOrder\": 8\n        },\n        {\n          \"id\": \"p_created_at\",\n          \"objectTypeId\": \"three_electric_system\",\n          \"name\": \"创建时间\",\n          \"type\": \"timestamp\",\n          \"description\": \"记录在系统中创建的时间\",\n          \"isPrimaryKey\": 0,\n          \"baseColumn\": \"created_at\",\n          \"typeClasses\": null,\n          \"sortOrder\": 9\n        },\n        {\n          \"id\": \"p_updated_at\",\n          \"objectTypeId\": \"three_electric_system\",\n          \"name\": \"更新时间\",\n          \"type\": \"timestamp\",\n          \"description\": \"记录最后一次更新的时间\",\n          \"isPrimaryKey\": 0,\n          \"baseColumn\": \"updated_at\",\n          \"typeClasses\": null,\n          \"sortOrder\": 10\n        },\n        {\n          \"id\": \"p_created_by\",\n          \"objectTypeId\": \"three_electric_system\",\n          \"name\": \"创建人\",\n          \"type\": \"string\",\n          \"description\": \"记录创建者的标识\",\n          \"isPrimaryKey\": 0,\n          \"baseColumn\": \"created_by\",\n          \"typeClasses\": null,\n          \"sortOrder\": 11\n        },\n        {\n          \"id\": \"p_updated_by\",\n          \"objectTypeId\": \"three_electric_system\",\n          \"name\": \"更新人\",\n          \"type\": \"string\",\n          \"description\": \"记录最后更新者的标识\",\n          \"isPrimaryKey\": 0,\n          \"baseColumn\": \"updated_by\",\n          \"typeClasses\": null,\n          \"sortOrder\": 12\n        }\n      ]\n    },\n    {\n      \"id\": \"enterprise\",\n      \"name\": \"企业\",\n      \"description\": \"产业链中的各类企业实体，包括矿业公司、材料商、电池厂、主机厂等。\",\n      \"icon\": \"Database\",\n      \"backingDataset\": \"enterprise\",\n      \"industryId\": null,\n      \"createdAt\": \"2026-04-06T18:37:52\",\n      \"updatedAt\": \"2026-04-06T18:37:52\",\n      \"properties\": [\n        {\n          \"id\": \"p_enterprise_id\",\n          \"objectTypeId\": \"enterprise\",\n          \"name\": \"企业ID\",\n          \"type\": \"string\",\n          \"description\": \"企业的唯一标识符，如统一社会信用代码\",\n          \"isPrimaryKey\": 1,\n          \"baseColumn\": \"enterprise_id\",\n          \"typeClasses\": null,\n          \"sortOrder\": 0\n        },\n        {\n          \"id\": \"p_enterprise_name\",\n          \"objectTypeId\": \"enterprise\",\n          \"name\": \"企业名称\",\n          \"type\": \"string\",\n          \"description\": \"企业的法定注册名称\",\n          \"isPrimaryKey\": 0,\n          \"baseColumn\": \"name\",\n          \"typeClasses\": null,\n          \"sortOrder\": 1\n        },\n        {\n          \"id\": \"p_enterprise_description\",\n          \"objectTypeId\": \"enterprise\",\n          \"name\": \"企业描述\",\n          \"type\": \"string\",\n          \"description\": \"企业的主营业务、行业地位等介绍\",\n          \"isPrimaryKey\": 0,\n          \"baseColumn\": \"description\",\n          \"typeClasses\": null,\n          \"sortOrder\": 2\n        },\n        {\n          \"id\": \"p_enterprise_status\",\n          \"objectTypeId\": \"enterprise\",\n          \"name\": \"企业状态\",\n          \"type\": \"string\",\n          \"description\": \"企业经营状态，如：存续、在业、注销、吊销\",\n          \"isPrimaryKey\": 0,\n          \"baseColumn\": \"status\",\n          \"typeClasses\": null,\n          \"sortOrder\": 3\n        },\n        {\n          \"id\": \"p_enterprise_type\",\n          \"objectTypeId\": \"enterprise\",\n          \"name\": \"企业类型\",\n          \"type\": \"string\",\n          \"description\": \"企业在产业链中的角色，如：矿业、材料、电池、整车制造\",\n          \"isPrimaryKey\": 0,\n          \"baseColumn\": \"type\",\n          \"typeClasses\": null,\n          \"sortOrder\": 4\n        },\n        {\n          \"id\": \"p_establishment_date\",\n          \"objectTypeId\": \"enterprise\",\n          \"name\": \"成立日期\",\n          \"type\": \"date\",\n          \"description\": \"企业的成立日期\",\n          \"isPrimaryKey\": 0,\n          \"baseColumn\": \"establishment_date\",\n          \"typeClasses\": null,\n          \"sortOrder\": 5\n        },\n        {\n          \"id\": \"p_registered_capital\",\n          \"objectTypeId\": \"enterprise\",\n          \"name\": \"注册资本（万元）\",\n          \"type\": \"number\",\n          \"description\": \"企业的注册资本\",\n          \"isPrimaryKey\": 0,\n          \"baseColumn\": \"registered_capital\",\n          \"typeClasses\": null,\n          \"sortOrder\": 6\n        },\n        {\n          \"id\": \"p_headquarters_location\",\n          \"objectTypeId\": \"enterprise\",\n          \"name\": \"总部所在地\",\n          \"type\": \"string\",\n          \"description\": \"企业总部所在的城市或国家\",\n          \"isPrimaryKey\": 0,\n          \"baseColumn\": \"headquarters\",\n          \"typeClasses\": null,\n          \"sortOrder\": 7\n        },\n        {\n          \"id\": \"p_created_at\",\n          \"objectTypeId\": \"enterprise\",\n          \"name\": \"创建时间\",\n          \"type\": \"timestamp\",\n          \"description\": \"记录在系统中创建的时间\",\n          \"isPrimaryKey\": 0,\n          \"baseColumn\": \"created_at\",\n          \"typeClasses\": null,\n          \"sortOrder\": 8\n        },\n        {\n          \"id\": \"p_updated_at\",\n          \"objectTypeId\": \"enterprise\",\n          \"name\": \"更新时间\",\n          \"type\": \"timestamp\",\n          \"description\": \"记录最后一次更新的时间\",\n          \"isPrimaryKey\": 0,\n          \"baseColumn\": \"updated_at\",\n          \"typeClasses\": null,\n          \"sortOrder\": 9\n        },\n        {\n          \"id\": \"p_created_by\",\n          \"objectTypeId\": \"enterprise\",\n          \"name\": \"创建人\",\n          \"type\": \"string\",\n          \"description\": \"记录创建者的标识\",\n          \"isPrimaryKey\": 0,\n          \"baseColumn\": \"created_by\",\n          \"typeClasses\": null,\n          \"sortOrder\": 10\n        },\n        {\n          \"id\": \"p_updated_by\",\n          \"objectTypeId\": \"enterprise\",\n          \"name\": \"更新人\",\n          \"type\": \"string\",\n          \"description\": \"记录最后更新者的标识\",\n          \"isPrimaryKey\": 0,\n          \"baseColumn\": \"updated_by\",\n          \"typeClasses\": null,\n          \"sortOrder\": 11\n        }\n      ]\n    },\n    {\n      \"id\": \"new_energy_vehicle\",\n      \"name\": \"新能源整车\",\n      \"description\": \"最终的新能源汽车产品，如纯电动车、插电混动车等。\",\n      \"icon\": \"Database\",\n      \"backingDataset\": \"new_energy_vehicle\",\n      \"industryId\": null,\n      \"createdAt\": \"2026-04-05T15:07:20\",\n      \"updatedAt\": \"2026-04-05T15:15:50\",\n      \"properties\": [\n        {\n          \"id\": \"p_vehicleid_1775385754771\",\n          \"objectTypeId\": \"new_energy_vehicle\",\n          \"name\": \"车辆唯一标识符（VIN码）\",\n          \"type\": \"string\",\n          \"description\": \"车辆识别代号，全球唯一\",\n          \"isPrimaryKey\": 1,\n          \"baseColumn\": \"vehicle_id\",\n          \"typeClasses\": null,\n          \"sortOrder\": 0\n        },\n        {\n          \"id\": \"p_modelname_1775385755582\",\n          \"objectTypeId\": \"new_energy_vehicle\",\n          \"name\": \"车型名称\",\n          \"type\": \"string\",\n          \"description\": \"车辆的市场型号名称\",\n          \"isPrimaryKey\": 0,\n          \"baseColumn\": \"model_name\",\n          \"typeClasses\": null,\n          \"sortOrder\": 1\n        },\n        {\n          \"id\": \"p_vehicle_description\",\n          \"objectTypeId\": \"new_energy_vehicle\",\n          \"name\": \"车型描述\",\n          \"type\": \"string\",\n          \"description\": \"关于该车型的配置、特点等详细描述\",\n          \"isPrimaryKey\": 0,\n          \"baseColumn\": \"description\",\n          \"typeClasses\": null,\n          \"sortOrder\": 2\n        },\n        {\n          \"id\": \"p_vehicle_status\",\n          \"objectTypeId\": \"new_energy_vehicle\",\n          \"name\": \"车辆状态\",\n          \"type\": \"string\",\n          \"description\": \"车辆生命周期状态，如：概念车、预售中、在产、已停产\",\n          \"isPrimaryKey\": 0,\n          \"baseColumn\": \"status\",\n          \"typeClasses\": null,\n          \"sortOrder\": 3\n        },\n        {\n          \"id\": \"p_brand_1775388584499\",\n          \"objectTypeId\": \"new_energy_vehicle\",\n          \"name\": \"品牌\",\n          \"type\": \"string\",\n          \"description\": \"车辆所属品牌\",\n          \"isPrimaryKey\": 0,\n          \"baseColumn\": \"brand\",\n          \"typeClasses\": null,\n          \"sortOrder\": 4\n        },\n        {\n          \"id\": \"p_vehicletype_1775385756547\",\n          \"objectTypeId\": \"new_energy_vehicle\",\n          \"name\": \"车辆类型\",\n          \"type\": \"string\",\n          \"description\": \"如：纯电动BEV、插电混动PHEV、增程式EREV\",\n          \"isPrimaryKey\": 0,\n          \"baseColumn\": \"vehicle_type\",\n          \"typeClasses\": null,\n          \"sortOrder\": 5\n        },\n        {\n          \"id\": \"p_batterycapacity_1775385756098\",\n          \"objectTypeId\": \"new_energy_vehicle\",\n          \"name\": \"电池容量（单位：kWh）\",\n          \"type\": \"number\",\n          \"description\": \"整车搭载的动力电池总容量\",\n          \"isPrimaryKey\": 0,\n          \"baseColumn\": \"battery_capacity\",\n          \"typeClasses\": null,\n          \"sortOrder\": 6\n        },\n        {\n          \"id\": \"p_range_1775385756349\",\n          \"objectTypeId\": \"new_energy_vehicle\",\n          \"name\": \"续航里程（单位：公里）\",\n          \"type\": \"number\",\n          \"description\": \"官方标定的综合工况续航里程\",\n          \"isPrimaryKey\": 0,\n          \"baseColumn\": \"range_km\",\n          \"typeClasses\": null,\n          \"sortOrder\": 7\n        },\n        {\n          \"id\": \"p_price_1775385757615\",\n          \"objectTypeId\": \"new_energy_vehicle\",\n          \"name\": \"指导价（单位：万元）\",\n          \"type\": \"number\",\n          \"description\": \"车辆的官方指导起售价\",\n          \"isPrimaryKey\": 0,\n          \"baseColumn\": \"price\",\n          \"typeClasses\": null,\n          \"sortOrder\": 8\n        },\n        {\n          \"id\": \"p_isavailable_1775385758165\",\n          \"objectTypeId\": \"new_energy_vehicle\",\n          \"name\": \"是否在售\",\n          \"type\": \"boolean\",\n          \"description\": \"标识该车型当前是否在市场上销售\",\n          \"isPrimaryKey\": 0,\n          \"baseColumn\": \"is_available\",\n          \"typeClasses\": null,\n          \"sortOrder\": 9\n        },\n        {\n          \"id\": \"p_productiondate_1775385756864\",\n          \"objectTypeId\": \"new_energy_vehicle\",\n          \"name\": \"生产日期\",\n          \"type\": \"date\",\n          \"description\": \"该车辆的具体生产日期\",\n          \"isPrimaryKey\": 0,\n          \"baseColumn\": \"production_date\",\n          \"typeClasses\": null,\n          \"sortOrder\": 10\n        },\n        {\n          \"id\": \"p_created_at\",\n          \"objectTypeId\": \"new_energy_vehicle\",\n          \"name\": \"创建时间\",\n          \"type\": \"timestamp\",\n          \"description\": \"记录在系统中创建的时间\",\n          \"isPrimaryKey\": 0,\n          \"baseColumn\": \"created_at\",\n          \"typeClasses\": null,\n          \", ontology=null}]', NULL, '2026-04-06 20:04:38', '2026-04-06 20:06:06');
INSERT INTO `ai_conversations` (`id`, `title`, `messages`, `preview_ontology`, `created_at`, `updated_at`) VALUES ('conv_f7820af2', '你能生成本体模型吗', '[{role=system, text=欢迎使用 AI Studio！我是你的本体建模助手。\n\n你可以：\n• 描述你的业务领域，我来生成完整的数据本体\n• 要求我添加、修改或删除实体和关系\n• 让我为已有本体添加语义层信息\n• 提问关于本体设计的最佳实践\n\n每次对话我都会在已有本体基础上迭代改进。}, {role=user, text=请帮我生成一个电商平台的本体，包括商品、订单、用户、店铺、评价、物流等核心实体}, {role=assistant, text=我将为您设计一个电商平台的本体。基于您已有的本体结构，我将添加电商相关的核心对象类型、属性、关系类型和动作类型。\n\n## 电商平台本体设计\n\n### 新增对象类型 (Object Types)\n\n\n\n### 新增关系类型 (Link Types)\n\n\n\n### 新增动作类型 (Action Types)\n\n\n\n##, ontology={objectTypes=[{id=user, name=用户, description=电商平台的注册用户, icon=User, backingDataset=user_dataset, properties=[{id=p_user_id, name=用户ID, type=string, isPrimaryKey=1, description=用户的唯一标识符}, {id=p_username, name=用户名, type=string, isPrimaryKey=0, description=用户登录名}, {id=p_email, name=邮箱, type=string, isPrimaryKey=0, description=用户邮箱地址}, {id=p_phone, name=手机号, type=string, isPrimaryKey=0, description=用户手机号码}, {id=p_registration_date, name=注册日期, type=date, isPrimaryKey=0, description=用户注册时间}, {id=p_user_level, name=用户等级, type=string, isPrimaryKey=0, description=用户等级（普通、VIP、SVIP等）}]}, {id=store, name=店铺, description=电商平台上的商家店铺, icon=Store, backingDataset=store_dataset, properties=[{id=p_store_id, name=店铺ID, type=string, isPrimaryKey=1, description=店铺的唯一标识符}, {id=p_store_name, name=店铺名称, type=string, isPrimaryKey=0, description=店铺的显示名称}, {id=p_owner_id, name=店主ID, type=string, isPrimaryKey=0, description=店铺所有者的用户ID}, {id=p_creation_date, name=创建日期, type=date, isPrimaryKey=0, description=店铺创建时间}, {id=p_store_rating, name=店铺评分, type=number, isPrimaryKey=0, description=店铺综合评分（0-5分）}, {id=p_store_status, name=店铺状态, type=string, isPrimaryKey=0, description=店铺运营状态（正常、休息、关闭等）}]}, {id=product, name=商品, description=电商平台上销售的商品, icon=Package, backingDataset=product_dataset, properties=[{id=p_product_id, name=商品ID, type=string, isPrimaryKey=1, description=商品的唯一标识符（SKU）}, {id=p_product_name, name=商品名称, type=string, isPrimaryKey=0, description=商品的显示名称}, {id=p_category, name=商品分类, type=string, isPrimaryKey=0, description=商品所属分类}, {id=p_price, name=价格, type=number, isPrimaryKey=0, description=商品销售价格}, {id=p_stock_quantity, name=库存数量, type=integer, isPrimaryKey=0, description=商品当前库存数量}, {id=p_product_status, name=商品状态, type=string, isPrimaryKey=0, description=商品状态（上架、下架、缺货等）}, {id=p_creation_date, name=创建日期, type=date, isPrimaryKey=0, description=商品上架时间}]}, {id=order, name=订单, description=用户购买商品生成的订单, icon=ShoppingCart, backingDataset=order_dataset, properties=[{id=p_order_id, name=订单ID, type=string, isPrimaryKey=1, description=订单的唯一标识符}, {id=p_order_date, name=下单时间, type=timestamp, isPrimaryKey=0, description=订单创建时间}, {id=p_total_amount, name=订单总金额, type=number, isPrimaryKey=0, description=订单应付总金额}, {id=p_payment_status, name=支付状态, type=string, isPrimaryKey=0, description=支付状态（待支付、已支付、已退款等）}, {id=p_order_status, name=订单状态, type=string, isPrimaryKey=0, description=订单状态（待发货、已发货、已完成、已取消等）}, {id=p_shipping_address, name=收货地址, type=string, isPrimaryKey=0, description=订单收货地址}]}, {id=order_item, name=订单项, description=订单中的单个商品项, icon=List, backingDataset=order_item_dataset, properties=[{id=p_order_item_id, name=订单项ID, type=string, isPrimaryKey=1, description=订单项的唯一标识符}, {id=p_quantity, name=购买数量, type=integer, isPrimaryKey=0, description=商品购买数量}, {id=p_unit_price, name=单价, type=number, isPrimaryKey=0, description=商品购买时的单价}, {id=p_subtotal, name=小计金额, type=number, isPrimaryKey=0, description=该项商品的总金额}]}, {id=review, name=评价, description=用户对商品或店铺的评价, icon=Star, backingDataset=review_dataset, properties=[{id=p_review_id, name=评价ID, type=string, isPrimaryKey=1, description=评价的唯一标识符}, {id=p_rating, name=评分, type=number, isPrimaryKey=0, description=评分（1-5分）}, {id=p_comment, name=评价内容, type=string, isPrimaryKey=0, description=用户评价的文字内容}, {id=p_review_date, name=评价时间, type=timestamp, isPrimaryKey=0, description=评价创建时间}, {id=p_is_verified_purchase, name=是否已验证购买, type=boolean, isPrimaryKey=0, description=是否为已验证购买的评价}]}, {id=logistics, name=物流, description=订单的物流信息, icon=Truck, backingDataset=logistics_dataset, properties=[{id=p_logistics_id, name=物流单号, type=string, isPrimaryKey=1, description=物流的唯一标识符}, {id=p_logistics_company, name=物流公司, type=string, isPrimaryKey=0, description=物流服务提供商}, {id=p_shipment_date, name=发货时间, type=timestamp, isPrimaryKey=0, description=商品发货时间}, {id=p_estimated_delivery, name=预计送达时间, type=timestamp, isPrimaryKey=0, description=预计送达时间}, {id=p_actual_delivery, name=实际送达时间, type=timestamp, isPrimaryKey=0, description=实际送达时间}, {id=p_current_status, name=当前状态, type=string, isPrimaryKey=0, description=物流当前状态（已揽收、运输中、派送中、已签收等）}, {id=p_tracking_url, name=物流跟踪链接, type=string, isPrimaryKey=0, description=物流跟踪查询链接}]}]}}]', '{objectTypes=[{id=user, name=用户, description=电商平台的注册用户, icon=User, backingDataset=user_dataset, properties=[{id=p_user_id, name=用户ID, type=string, isPrimaryKey=1, description=用户的唯一标识符}, {id=p_username, name=用户名, type=string, isPrimaryKey=0, description=用户登录名}, {id=p_email, name=邮箱, type=string, isPrimaryKey=0, description=用户邮箱地址}, {id=p_phone, name=手机号, type=string, isPrimaryKey=0, description=用户手机号码}, {id=p_registration_date, name=注册日期, type=date, isPrimaryKey=0, description=用户注册时间}, {id=p_user_level, name=用户等级, type=string, isPrimaryKey=0, description=用户等级（普通、VIP、SVIP等）}]}, {id=store, name=店铺, description=电商平台上的商家店铺, icon=Store, backingDataset=store_dataset, properties=[{id=p_store_id, name=店铺ID, type=string, isPrimaryKey=1, description=店铺的唯一标识符}, {id=p_store_name, name=店铺名称, type=string, isPrimaryKey=0, description=店铺的显示名称}, {id=p_owner_id, name=店主ID, type=string, isPrimaryKey=0, description=店铺所有者的用户ID}, {id=p_creation_date, name=创建日期, type=date, isPrimaryKey=0, description=店铺创建时间}, {id=p_store_rating, name=店铺评分, type=number, isPrimaryKey=0, description=店铺综合评分（0-5分）}, {id=p_store_status, name=店铺状态, type=string, isPrimaryKey=0, description=店铺运营状态（正常、休息、关闭等）}]}, {id=product, name=商品, description=电商平台上销售的商品, icon=Package, backingDataset=product_dataset, properties=[{id=p_product_id, name=商品ID, type=string, isPrimaryKey=1, description=商品的唯一标识符（SKU）}, {id=p_product_name, name=商品名称, type=string, isPrimaryKey=0, description=商品的显示名称}, {id=p_category, name=商品分类, type=string, isPrimaryKey=0, description=商品所属分类}, {id=p_price, name=价格, type=number, isPrimaryKey=0, description=商品销售价格}, {id=p_stock_quantity, name=库存数量, type=integer, isPrimaryKey=0, description=商品当前库存数量}, {id=p_product_status, name=商品状态, type=string, isPrimaryKey=0, description=商品状态（上架、下架、缺货等）}, {id=p_creation_date, name=创建日期, type=date, isPrimaryKey=0, description=商品上架时间}]}, {id=order, name=订单, description=用户购买商品生成的订单, icon=ShoppingCart, backingDataset=order_dataset, properties=[{id=p_order_id, name=订单ID, type=string, isPrimaryKey=1, description=订单的唯一标识符}, {id=p_order_date, name=下单时间, type=timestamp, isPrimaryKey=0, description=订单创建时间}, {id=p_total_amount, name=订单总金额, type=number, isPrimaryKey=0, description=订单应付总金额}, {id=p_payment_status, name=支付状态, type=string, isPrimaryKey=0, description=支付状态（待支付、已支付、已退款等）}, {id=p_order_status, name=订单状态, type=string, isPrimaryKey=0, description=订单状态（待发货、已发货、已完成、已取消等）}, {id=p_shipping_address, name=收货地址, type=string, isPrimaryKey=0, description=订单收货地址}]}, {id=order_item, name=订单项, description=订单中的单个商品项, icon=List, backingDataset=order_item_dataset, properties=[{id=p_order_item_id, name=订单项ID, type=string, isPrimaryKey=1, description=订单项的唯一标识符}, {id=p_quantity, name=购买数量, type=integer, isPrimaryKey=0, description=商品购买数量}, {id=p_unit_price, name=单价, type=number, isPrimaryKey=0, description=商品购买时的单价}, {id=p_subtotal, name=小计金额, type=number, isPrimaryKey=0, description=该项商品的总金额}]}, {id=review, name=评价, description=用户对商品或店铺的评价, icon=Star, backingDataset=review_dataset, properties=[{id=p_review_id, name=评价ID, type=string, isPrimaryKey=1, description=评价的唯一标识符}, {id=p_rating, name=评分, type=number, isPrimaryKey=0, description=评分（1-5分）}, {id=p_comment, name=评价内容, type=string, isPrimaryKey=0, description=用户评价的文字内容}, {id=p_review_date, name=评价时间, type=timestamp, isPrimaryKey=0, description=评价创建时间}, {id=p_is_verified_purchase, name=是否已验证购买, type=boolean, isPrimaryKey=0, description=是否为已验证购买的评价}]}, {id=logistics, name=物流, description=订单的物流信息, icon=Truck, backingDataset=logistics_dataset, properties=[{id=p_logistics_id, name=物流单号, type=string, isPrimaryKey=1, description=物流的唯一标识符}, {id=p_logistics_company, name=物流公司, type=string, isPrimaryKey=0, description=物流服务提供商}, {id=p_shipment_date, name=发货时间, type=timestamp, isPrimaryKey=0, description=商品发货时间}, {id=p_estimated_delivery, name=预计送达时间, type=timestamp, isPrimaryKey=0, description=预计送达时间}, {id=p_actual_delivery, name=实际送达时间, type=timestamp, isPrimaryKey=0, description=实际送达时间}, {id=p_current_status, name=当前状态, type=string, isPrimaryKey=0, description=物流当前状态（已揽收、运输中、派送中、已签收等）}, {id=p_tracking_url, name=物流跟踪链接, type=string, isPrimaryKey=0, description=物流跟踪查询链接}]}]}', '2026-04-06 20:02:24', '2026-04-06 20:05:51');
COMMIT;

-- ----------------------------
-- Table structure for battery_cell
-- ----------------------------
DROP TABLE IF EXISTS `battery_cell`;
CREATE TABLE `battery_cell` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '自增主键ID',
  `unique_id` varchar(100) NOT NULL COMMENT '电芯唯一标识符',
  `model` varchar(200) DEFAULT NULL COMMENT '电芯型号',
  `manufacturer` varchar(100) DEFAULT NULL COMMENT '生产厂家',
  `price` decimal(12,2) DEFAULT NULL COMMENT '价格（元/kWh）',
  `price_date` date DEFAULT NULL COMMENT '价格日期',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_id` (`unique_id`),
  KEY `idx_unique_id` (`unique_id`),
  KEY `idx_manufacturer` (`manufacturer`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='电池电芯信息表';

-- ----------------------------
-- Records of battery_cell
-- ----------------------------
BEGIN;
INSERT INTO `battery_cell` (`id`, `unique_id`, `model`, `manufacturer`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (1, 'BC-ATL-001-2024', 'ATL-2714895-120Ah', '宁德时代', 0.85, '2024-03-01', '2026-04-08 20:40:11', '2026-04-08 20:40:11');
INSERT INTO `battery_cell` (`id`, `unique_id`, `model`, `manufacturer`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (2, 'BC-ATL-002-2024', 'ATL-4680-25Ah', '宁德时代', 0.92, '2024-03-01', '2026-04-08 20:40:11', '2026-04-08 20:40:11');
INSERT INTO `battery_cell` (`id`, `unique_id`, `model`, `manufacturer`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (3, 'BC-BYD-001-2024', 'BYD-刀片-135Ah', '比亚迪', 0.78, '2024-02-15', '2026-04-08 20:40:11', '2026-04-08 20:40:11');
INSERT INTO `battery_cell` (`id`, `unique_id`, `model`, `manufacturer`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (4, 'BC-LG-001-2024', 'LG-21700-5Ah', 'LG新能源', 1.05, '2024-03-10', '2026-04-08 20:40:11', '2026-04-08 20:40:11');
INSERT INTO `battery_cell` (`id`, `unique_id`, `model`, `manufacturer`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (5, 'BC-LG-002-2024', 'LG-4680-23Ah', 'LG新能源', 0.98, '2024-01-20', '2026-04-08 20:40:11', '2026-04-08 20:40:11');
INSERT INTO `battery_cell` (`id`, `unique_id`, `model`, `manufacturer`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (6, 'BC-SK-001-2024', 'SK-软包-60Ah', 'SK创新', 0.88, '2024-02-28', '2026-04-08 20:40:11', '2026-04-08 20:40:11');
INSERT INTO `battery_cell` (`id`, `unique_id`, `model`, `manufacturer`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (7, 'BC-PANA-001-2024', '松下-18650-3.4Ah', '松下', 1.12, '2024-03-05', '2026-04-08 20:40:11', '2026-04-08 20:40:11');
INSERT INTO `battery_cell` (`id`, `unique_id`, `model`, `manufacturer`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (8, 'BC-SVOLT-001-2024', '蜂巢-短刀-80Ah', '蜂巢能源', 0.82, '2024-01-15', '2026-04-08 20:40:11', '2026-04-08 20:40:11');
INSERT INTO `battery_cell` (`id`, `unique_id`, `model`, `manufacturer`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (9, 'BC-CALB-001-2024', '中创新航-方壳-150Ah', '中创新航', 0.75, '2024-03-12', '2026-04-08 20:40:11', '2026-04-08 20:40:11');
INSERT INTO `battery_cell` (`id`, `unique_id`, `model`, `manufacturer`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (10, 'BC-EVE-001-2024', '亿纬-圆柱-4.2Ah', '亿纬锂能', 0.68, '2024-02-22', '2026-04-08 20:40:11', '2026-04-08 20:40:11');
COMMIT;

-- ----------------------------
-- Table structure for battery_electrolyte
-- ----------------------------
DROP TABLE IF EXISTS `battery_electrolyte`;
CREATE TABLE `battery_electrolyte` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '自增主键ID',
  `unique_id` varchar(100) NOT NULL COMMENT '电解液唯一标识符',
  `name` varchar(200) DEFAULT NULL COMMENT '电解液名称或型号',
  `electrolyte_type` varchar(50) DEFAULT NULL COMMENT '电解液类型（如：液态、固态、凝胶、有机、无机等）',
  `price` decimal(12,2) DEFAULT NULL COMMENT '价格（万元/吨）',
  `price_date` date DEFAULT NULL COMMENT '价格日期',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_id` (`unique_id`),
  KEY `idx_unique_id` (`unique_id`),
  KEY `idx_electrolyte_type` (`electrolyte_type`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='电池电解液信息表';

-- ----------------------------
-- Records of battery_electrolyte
-- ----------------------------
BEGIN;
INSERT INTO `battery_electrolyte` (`id`, `unique_id`, `name`, `electrolyte_type`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (1, 'EL-LP-001-2024', 'LP-301 液态电解液', '液态', 3.50, '2024-03-01', '2026-04-08 20:25:35', '2026-04-08 20:25:35');
INSERT INTO `battery_electrolyte` (`id`, `unique_id`, `name`, `electrolyte_type`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (2, 'EL-LP-002-2024', 'LP-302 高纯液态电解液', '液态', 4.20, '2024-03-01', '2026-04-08 20:25:35', '2026-04-08 20:25:35');
INSERT INTO `battery_electrolyte` (`id`, `unique_id`, `name`, `electrolyte_type`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (3, 'EL-LP-003-2024', 'LP-303 低温液态电解液', '液态', 4.80, '2024-02-15', '2026-04-08 20:25:35', '2026-04-08 20:25:35');
INSERT INTO `battery_electrolyte` (`id`, `unique_id`, `name`, `electrolyte_type`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (4, 'EL-SS-001-2024', 'SS-101 固态电解质', '固态', 12.50, '2024-03-10', '2026-04-08 20:25:35', '2026-04-08 20:25:35');
INSERT INTO `battery_electrolyte` (`id`, `unique_id`, `name`, `electrolyte_type`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (5, 'EL-SS-002-2024', 'SS-102 硫化物固态电解质', '固态', 15.80, '2024-03-10', '2026-04-08 20:25:35', '2026-04-08 20:25:35');
INSERT INTO `battery_electrolyte` (`id`, `unique_id`, `name`, `electrolyte_type`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (6, 'EL-SS-003-2024', 'SS-103 氧化物固态电解质', '固态', 14.20, '2024-02-28', '2026-04-08 20:25:35', '2026-04-08 20:25:35');
INSERT INTO `battery_electrolyte` (`id`, `unique_id`, `name`, `electrolyte_type`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (7, 'EL-GL-001-2024', 'GL-201 凝胶电解质', '凝胶', 6.80, '2024-01-20', '2026-04-08 20:25:35', '2026-04-08 20:25:35');
INSERT INTO `battery_electrolyte` (`id`, `unique_id`, `name`, `electrolyte_type`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (8, 'EL-GL-002-2024', 'GL-202 聚合物凝胶电解质', '凝胶', 7.50, '2024-01-20', '2026-04-08 20:25:35', '2026-04-08 20:25:35');
INSERT INTO `battery_electrolyte` (`id`, `unique_id`, `name`, `electrolyte_type`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (9, 'EL-OR-001-2024', 'OR-401 有机电解液', '有机', 5.20, '2024-03-05', '2026-04-08 20:25:35', '2026-04-08 20:25:35');
INSERT INTO `battery_electrolyte` (`id`, `unique_id`, `name`, `electrolyte_type`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (10, 'EL-OR-002-2024', 'OR-402 碳酸酯类电解液', '有机', 4.80, '2024-03-05', '2026-04-08 20:25:35', '2026-04-08 20:25:35');
INSERT INTO `battery_electrolyte` (`id`, `unique_id`, `name`, `electrolyte_type`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (11, 'EL-OR-003-2024', 'OR-403 醚类电解液', '有机', 5.50, '2024-02-22', '2026-04-08 20:25:35', '2026-04-08 20:25:35');
INSERT INTO `battery_electrolyte` (`id`, `unique_id`, `name`, `electrolyte_type`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (12, 'EL-IN-001-2024', 'IN-501 无机电解液', '无机', 3.80, '2024-01-15', '2026-04-08 20:25:35', '2026-04-08 20:25:35');
INSERT INTO `battery_electrolyte` (`id`, `unique_id`, `name`, `electrolyte_type`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (13, 'EL-IN-002-2024', 'IN-502 离子液体电解质', '无机', 8.50, '2024-01-15', '2026-04-08 20:25:35', '2026-04-08 20:25:35');
INSERT INTO `battery_electrolyte` (`id`, `unique_id`, `name`, `electrolyte_type`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (14, 'EL-HV-001-2024', 'HV-601 高电压电解液', '液态', 6.20, '2024-03-12', '2026-04-08 20:25:35', '2026-04-08 20:25:35');
INSERT INTO `battery_electrolyte` (`id`, `unique_id`, `name`, `electrolyte_type`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (15, 'EL-HV-002-2024', 'HV-602 4.5V高电压电解液', '液态', 7.80, '2024-03-12', '2026-04-08 20:25:35', '2026-04-08 20:25:35');
INSERT INTO `battery_electrolyte` (`id`, `unique_id`, `name`, `electrolyte_type`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (16, 'EL-FD-001-2024', 'FD-701 快充型电解液', '液态', 5.80, '2024-02-08', '2026-04-08 20:25:35', '2026-04-08 20:25:35');
INSERT INTO `battery_electrolyte` (`id`, `unique_id`, `name`, `electrolyte_type`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (17, 'EL-FD-002-2024', 'FD-702 超快充电解液', '液态', 6.50, '2024-02-08', '2026-04-08 20:25:35', '2026-04-08 20:25:35');
INSERT INTO `battery_electrolyte` (`id`, `unique_id`, `name`, `electrolyte_type`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (18, 'EL-LT-001-2024', 'LT-801 低温型电解液', '液态', 5.50, '2024-03-15', '2026-04-08 20:25:35', '2026-04-08 20:25:35');
INSERT INTO `battery_electrolyte` (`id`, `unique_id`, `name`, `electrolyte_type`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (19, 'EL-HT-001-2024', 'HT-901 高温型电解液', '液态', 4.80, '2024-03-15', '2026-04-08 20:25:35', '2026-04-08 20:25:35');
INSERT INTO `battery_electrolyte` (`id`, `unique_id`, `name`, `electrolyte_type`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (20, 'EL-SI-001-2024', 'SI-111 硅负极专用电解液', '液态', 8.20, '2024-02-25', '2026-04-08 20:25:35', '2026-04-08 20:25:35');
COMMIT;

-- ----------------------------
-- Table structure for cathode_material
-- ----------------------------
DROP TABLE IF EXISTS `cathode_material`;
CREATE TABLE `cathode_material` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '自增主键ID',
  `material_id` varchar(100) NOT NULL COMMENT '正极材料的唯一标识符',
  `material_name` varchar(100) DEFAULT NULL COMMENT '正极材料的名称，如NCM811、LFP、LCO等',
  `price` decimal(12,2) DEFAULT NULL COMMENT '价格（万元/吨）',
  `price_date` date DEFAULT NULL COMMENT '价格日期',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `material_id` (`material_id`),
  KEY `idx_material_id` (`material_id`),
  KEY `idx_material_name` (`material_name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='正极材料信息表';

-- ----------------------------
-- Records of cathode_material
-- ----------------------------
BEGIN;
INSERT INTO `cathode_material` (`id`, `material_id`, `material_name`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (1, 'CM-NCM811-2024', 'NCM811', 18.50, '2024-03-01', '2026-04-08 20:32:09', '2026-04-08 20:32:09');
INSERT INTO `cathode_material` (`id`, `material_id`, `material_name`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (2, 'CM-NCM622-2024', 'NCM622', 15.20, '2024-03-01', '2026-04-08 20:32:09', '2026-04-08 20:32:09');
INSERT INTO `cathode_material` (`id`, `material_id`, `material_name`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (3, 'CM-NCM523-2024', 'NCM523', 13.80, '2024-02-15', '2026-04-08 20:32:09', '2026-04-08 20:32:09');
INSERT INTO `cathode_material` (`id`, `material_id`, `material_name`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (4, 'CM-LFP-2024', 'LFP', 4.20, '2024-03-10', '2026-04-08 20:32:09', '2026-04-08 20:32:09');
INSERT INTO `cathode_material` (`id`, `material_id`, `material_name`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (5, 'CM-LCO-2024', 'LCO', 22.50, '2024-01-20', '2026-04-08 20:32:09', '2026-04-08 20:32:09');
INSERT INTO `cathode_material` (`id`, `material_id`, `material_name`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (6, 'CM-NCA-2024', 'NCA', 19.80, '2024-02-28', '2026-04-08 20:32:09', '2026-04-08 20:32:09');
INSERT INTO `cathode_material` (`id`, `material_id`, `material_name`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (7, 'CM-LMO-2024', 'LMO', 8.50, '2024-03-05', '2026-04-08 20:32:09', '2026-04-08 20:32:09');
INSERT INTO `cathode_material` (`id`, `material_id`, `material_name`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (8, 'CM-NCM712-2024', 'NCM712', 16.80, '2024-01-15', '2026-04-08 20:32:09', '2026-04-08 20:32:09');
INSERT INTO `cathode_material` (`id`, `material_id`, `material_name`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (9, 'CM-LFMP-2024', 'LFMP', 5.80, '2024-03-12', '2026-04-08 20:32:09', '2026-04-08 20:32:09');
INSERT INTO `cathode_material` (`id`, `material_id`, `material_name`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (10, 'CM-NCM901-2024', 'NCM901', 21.20, '2024-02-22', '2026-04-08 20:32:09', '2026-04-08 20:32:09');
COMMIT;

-- ----------------------------
-- Table structure for function_type
-- ----------------------------
DROP TABLE IF EXISTS `function_type`;
CREATE TABLE `function_type` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL COMMENT '函数名',
  `rest_route` varchar(500) NOT NULL COMMENT 'Rest路由',
  `input_params` json DEFAULT NULL COMMENT '入参配置（JSON格式）',
  `output_params` json DEFAULT NULL COMMENT '出参配置（JSON格式）',
  `description` text COMMENT '函数描述',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='函数类型表';

-- ----------------------------
-- Records of function_type
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for industry_categories
-- ----------------------------
DROP TABLE IF EXISTS `industry_categories`;
CREATE TABLE `industry_categories` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `level` int NOT NULL DEFAULT '1',
  `parent_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of industry_categories
-- ----------------------------
BEGIN;
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_110000', '110000', '农林牧渔', 1, NULL, 1, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_110100', '110100', '种植业', 2, 'sw_110000', 1, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_110200', '110200', '养殖业', 2, 'sw_110000', 2, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_110300', '110300', '林业', 2, 'sw_110000', 3, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_110400', '110400', '饲料', 2, 'sw_110000', 4, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_110500', '110500', '渔业', 2, 'sw_110000', 5, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_110600', '110600', '农业综合', 2, 'sw_110000', 6, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_220000', '220000', '基础化工', 1, NULL, 13, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_220100', '220100', '化学原料', 2, 'sw_220000', 1, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_220200', '220200', '化学制品', 2, 'sw_220000', 2, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_220300', '220300', '化学纤维', 2, 'sw_220000', 3, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_220400', '220400', '塑料', 2, 'sw_220000', 4, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_220500', '220500', '橡胶', 2, 'sw_220000', 5, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_230000', '230000', '钢铁', 1, NULL, 15, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_240000', '240000', '有色金属', 1, NULL, 12, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_240100', '240100', '工业金属', 2, 'sw_240000', 1, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_240200', '240200', '贵金属', 2, 'sw_240000', 2, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_240300', '240300', '小金属', 2, 'sw_240000', 3, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_240400', '240400', '能源金属', 2, 'sw_240000', 4, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_240401', '240401', '锂', 3, 'sw_240400', 1, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_240402', '240402', '钴', 3, 'sw_240400', 2, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_240403', '240403', '镍', 3, 'sw_240400', 3, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_270000', '270000', '电子', 1, NULL, 26, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_270100', '270100', '半导体', 2, 'sw_270000', 1, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_270101', '270101', '数字芯片设计', 3, 'sw_270100', 1, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_270102', '270102', '模拟芯片设计', 3, 'sw_270100', 2, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_270103', '270103', '集成电路制造', 3, 'sw_270100', 3, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_270104', '270104', '集成电路封测', 3, 'sw_270100', 4, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_270105', '270105', '半导体材料', 3, 'sw_270100', 5, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_270106', '270106', '半导体设备', 3, 'sw_270100', 6, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_270107', '270107', '分立器件', 3, 'sw_270100', 7, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_270200', '270200', '元件', 2, 'sw_270000', 2, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_270201', '270201', '印制电路板', 3, 'sw_270200', 1, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_270202', '270202', '被动元件', 3, 'sw_270200', 2, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_270300', '270300', '光学光电子', 2, 'sw_270000', 3, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_270301', '270301', '面板', 3, 'sw_270300', 1, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_270302', '270302', 'LED', 3, 'sw_270300', 2, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_270303', '270303', '光学元件', 3, 'sw_270300', 3, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_270400', '270400', '消费电子', 2, 'sw_270000', 4, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_270401', '270401', '品牌消费电子', 3, 'sw_270400', 1, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_270402', '270402', '消费电子零部件及组装', 3, 'sw_270400', 2, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_270500', '270500', '电子化学品', 2, 'sw_270000', 5, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_280000', '280000', '汽车', 1, NULL, 22, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_280100', '280100', '乘用车', 2, 'sw_280000', 1, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_280101', '280101', '电动乘用车', 3, 'sw_280100', 1, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_280102', '280102', '综合乘用车', 3, 'sw_280100', 2, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_280200', '280200', '商用车', 2, 'sw_280000', 2, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_280300', '280300', '汽车零部件', 2, 'sw_280000', 3, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_280301', '280301', '底盘与发动机系统', 3, 'sw_280300', 1, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_280302', '280302', '车身附件及饰件', 3, 'sw_280300', 2, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_280303', '280303', '汽车电子电气系统', 3, 'sw_280300', 3, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_280304', '280304', '轮胎轮毂', 3, 'sw_280300', 4, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_280400', '280400', '汽车服务', 2, 'sw_280000', 4, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_330000', '330000', '家用电器', 1, NULL, 4, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_330100', '330100', '白色家电', 2, 'sw_330000', 1, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_330200', '330200', '黑色家电', 2, 'sw_330000', 2, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_330300', '330300', '小家电', 2, 'sw_330000', 3, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_330400', '330400', '厨卫电器', 2, 'sw_330000', 4, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_330500', '330500', '照明设备', 2, 'sw_330000', 5, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_340000', '340000', '食品饮料', 1, NULL, 2, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_340100', '340100', '白酒', 2, 'sw_340000', 1, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_340200', '340200', '啤酒', 2, 'sw_340000', 2, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_340300', '340300', '其他酒类', 2, 'sw_340000', 3, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_340400', '340400', '饮料乳品', 2, 'sw_340000', 4, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_340500', '340500', '食品加工', 2, 'sw_340000', 5, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_340600', '340600', '休闲食品', 2, 'sw_340000', 6, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_340700', '340700', '调味发酵品', 2, 'sw_340000', 7, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_350000', '350000', '纺织服饰', 1, NULL, 5, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_360000', '360000', '轻工制造', 1, NULL, 6, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_370000', '370000', '医药生物', 1, NULL, 3, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_370100', '370100', '化学制药', 2, 'sw_370000', 1, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_370101', '370101', '化学原料药', 3, 'sw_370100', 1, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_370102', '370102', '化学制剂', 3, 'sw_370100', 2, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_370200', '370200', '中药', 2, 'sw_370000', 2, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_370300', '370300', '生物制品', 2, 'sw_370000', 3, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_370301', '370301', '血液制品', 3, 'sw_370300', 1, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_370302', '370302', '疫苗', 3, 'sw_370300', 2, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_370303', '370303', '其他生物制品', 3, 'sw_370300', 3, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_370400', '370400', '医疗器械', 2, 'sw_370000', 4, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_370401', '370401', '医疗设备', 3, 'sw_370400', 1, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_370402', '370402', '医疗耗材', 3, 'sw_370400', 2, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_370403', '370403', '体外诊断', 3, 'sw_370400', 3, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_370500', '370500', '医药商业', 2, 'sw_370000', 5, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_370600', '370600', '医疗服务', 2, 'sw_370000', 6, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_370601', '370601', '诊断服务', 3, 'sw_370600', 1, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_370602', '370602', '医疗研发外包', 3, 'sw_370600', 2, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_410000', '410000', '公用事业', 1, NULL, 19, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_420000', '420000', '交通运输', 1, NULL, 25, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_420100', '420100', '港口', 2, 'sw_420000', 1, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_420200', '420200', '航运', 2, 'sw_420000', 2, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_420300', '420300', '公路铁路', 2, 'sw_420000', 3, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_420400', '420400', '航空机场', 2, 'sw_420000', 4, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_420500', '420500', '物流', 2, 'sw_420000', 5, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_430000', '430000', '房地产', 1, NULL, 21, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_430100', '430100', '房地产开发', 2, 'sw_430000', 1, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_430200', '430200', '房地产服务', 2, 'sw_430000', 2, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_450000', '450000', '商贸零售', 1, NULL, 7, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_450100', '450100', '一般零售', 2, 'sw_450000', 1, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_450200', '450200', '专业连锁', 2, 'sw_450000', 2, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_450300', '450300', '互联网电商', 2, 'sw_450000', 3, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_450301', '450301', '综合电商', 3, 'sw_450300', 1, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_450302', '450302', '跨境电商', 3, 'sw_450300', 2, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_460000', '460000', '社会服务', 1, NULL, 9, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_480000', '480000', '银行', 1, NULL, 23, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_480100', '480100', '国有大型银行', 2, 'sw_480000', 1, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_480200', '480200', '股份制银行', 2, 'sw_480000', 2, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_480300', '480300', '城商行', 2, 'sw_480000', 3, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_480400', '480400', '农商行', 2, 'sw_480000', 4, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_490000', '490000', '非银金融', 1, NULL, 24, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_490100', '490100', '证券', 2, 'sw_490000', 1, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_490200', '490200', '保险', 2, 'sw_490000', 2, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_490300', '490300', '多元金融', 2, 'sw_490000', 3, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_510000', '510000', '综合', 1, NULL, 31, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_610000', '610000', '建筑材料', 1, NULL, 14, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_620000', '620000', '建筑装饰', 1, NULL, 20, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_630000', '630000', '电力设备', 1, NULL, 17, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_630100', '630100', '电池', 2, 'sw_630000', 1, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_630101', '630101', '锂电池', 3, 'sw_630100', 1, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_630102', '630102', '电池化学品', 3, 'sw_630100', 2, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_630103', '630103', '锂电专用设备', 3, 'sw_630100', 3, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_630200', '630200', '光伏设备', 2, 'sw_630000', 2, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_630201', '630201', '硅料硅片', 3, 'sw_630200', 1, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_630202', '630202', '光伏电池组件', 3, 'sw_630200', 2, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_630203', '630203', '逆变器', 3, 'sw_630200', 3, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_630204', '630204', '光伏辅材', 3, 'sw_630200', 4, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_630300', '630300', '风电设备', 2, 'sw_630000', 3, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_630301', '630301', '风电零部件', 3, 'sw_630300', 1, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_630302', '630302', '风电整机', 3, 'sw_630300', 2, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_630400', '630400', '电网设备', 2, 'sw_630000', 4, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_630500', '630500', '电机', 2, 'sw_630000', 5, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_640000', '640000', '机械设备', 1, NULL, 16, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_640100', '640100', '通用设备', 2, 'sw_640000', 1, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_640200', '640200', '专用设备', 2, 'sw_640000', 2, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_640300', '640300', '自动化设备', 2, 'sw_640000', 3, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_640301', '640301', '工业机器人', 3, 'sw_640300', 1, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_640302', '640302', '激光设备', 3, 'sw_640300', 2, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_640303', '640303', '3C自动化设备', 3, 'sw_640300', 3, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_650000', '650000', '计算机', 1, NULL, 27, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_650100', '650100', '计算机设备', 2, 'sw_650000', 1, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_650101', '650101', '计算机整机', 3, 'sw_650100', 1, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_650102', '650102', '网络设备', 3, 'sw_650100', 2, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_650200', '650200', 'IT服务', 2, 'sw_650000', 2, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_650300', '650300', '软件开发', 2, 'sw_650000', 3, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_650301', '650301', '行业应用软件', 3, 'sw_650300', 1, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_650302', '650302', '基础软件', 3, 'sw_650300', 2, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_650303', '650303', '信息安全', 3, 'sw_650300', 3, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_670000', '670000', '国防军工', 1, NULL, 29, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_670100', '670100', '航空装备', 2, 'sw_670000', 1, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_670200', '670200', '航天装备', 2, 'sw_670000', 2, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_670300', '670300', '地面兵装', 2, 'sw_670000', 3, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_670400', '670400', '船舶制造', 2, 'sw_670000', 4, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_670500', '670500', '军工电子', 2, 'sw_670000', 5, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_710000', '710000', '传媒', 1, NULL, 30, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_710100', '710100', '游戏', 2, 'sw_710000', 1, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_710200', '710200', '数字媒体', 2, 'sw_710000', 2, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_710300', '710300', '广告营销', 2, 'sw_710000', 3, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_710400', '710400', '影视院线', 2, 'sw_710000', 4, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_710500', '710500', '出版', 2, 'sw_710000', 5, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_720000', '720000', '通信', 1, NULL, 28, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_720100', '720100', '通信设备', 2, 'sw_720000', 1, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_720101', '720101', '通信网络设备及器件', 3, 'sw_720100', 1, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_720102', '720102', '通信终端及配件', 3, 'sw_720100', 2, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_720200', '720200', '通信服务', 2, 'sw_720000', 2, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_720201', '720201', '电信运营', 3, 'sw_720200', 1, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_720202', '720202', '增值服务', 3, 'sw_720200', 2, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_730000', '730000', '煤炭', 1, NULL, 11, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_740000', '740000', '石油石化', 1, NULL, 10, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_750000', '750000', '环保', 1, NULL, 18, '', '2026-04-03 12:19:38');
INSERT INTO `industry_categories` (`id`, `code`, `name`, `level`, `parent_id`, `sort_order`, `description`, `created_at`) VALUES ('sw_760000', '760000', '美容护理', 1, NULL, 8, '', '2026-04-03 12:19:38');
COMMIT;

-- ----------------------------
-- Table structure for link_instance_data
-- ----------------------------
DROP TABLE IF EXISTS `link_instance_data`;
CREATE TABLE `link_instance_data` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '自增主键ID',
  `link_type_id` varchar(100) NOT NULL COMMENT '链接类型ID',
  `source_instance_id` varchar(100) NOT NULL COMMENT '源对象实例唯一标识',
  `target_instance_id` varchar(100) NOT NULL COMMENT '目标对象实例唯一标识',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_link_type` (`link_type_id`),
  KEY `idx_source_instance` (`source_instance_id`),
  KEY `idx_target_instance` (`target_instance_id`)
) ENGINE=InnoDB AUTO_INCREMENT=104 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='链接实例数据表';

-- ----------------------------
-- Records of link_instance_data
-- ----------------------------
BEGIN;
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (1, 'lt_battery_cell_battery_electrolyte_1775655447785', 'BC-ATL-001-2024', 'EL-LP-001-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (2, 'lt_battery_cell_battery_electrolyte_1775655447785', 'BC-ATL-002-2024', 'EL-LP-001-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (3, 'lt_battery_cell_battery_electrolyte_1775655447785', 'BC-BYD-001-2024', 'EL-LP-002-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (4, 'lt_battery_cell_battery_electrolyte_1775655447785', 'BC-CALB-001-2024', 'EL-HV-001-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (5, 'lt_battery_cell_battery_electrolyte_1775655447785', 'BC-EVE-001-2024', 'EL-HV-002-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (6, 'lt_battery_cell_battery_electrolyte_1775655447785', 'BC-LG-001-2024', 'EL-IN-001-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (7, 'lt_battery_cell_battery_electrolyte_1775655447785', 'BC-LG-002-2024', 'EL-IN-001-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (8, 'lt_battery_cell_battery_electrolyte_1775655447785', 'BC-PANA-001-2024', 'EL-SS-001-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (9, 'lt_battery_cell_battery_electrolyte_1775655447785', 'BC-SK-001-2024', 'EL-SS-002-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (10, 'lt_battery_cell_battery_electrolyte_1775655447785', 'BC-SVOLT-001-2024', 'EL-SS-003-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (11, 'lt_battery_cell_cathode_material_1775472265881', 'BC-ATL-001-2024', 'CM-NCM811-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (12, 'lt_battery_cell_cathode_material_1775472265881', 'BC-ATL-002-2024', 'CM-LFP-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (13, 'lt_battery_cell_cathode_material_1775472265881', 'BC-BYD-001-2024', 'CM-LFP-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (14, 'lt_battery_cell_cathode_material_1775472265881', 'BC-CALB-001-2024', 'CM-LFP-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (15, 'lt_battery_cell_cathode_material_1775472265881', 'BC-EVE-001-2024', 'CM-NCM523-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (16, 'lt_battery_cell_cathode_material_1775472265881', 'BC-LG-001-2024', 'CM-NCM712-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (17, 'lt_battery_cell_cathode_material_1775472265881', 'BC-LG-002-2024', 'CM-NCM811-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (18, 'lt_battery_cell_cathode_material_1775472265881', 'BC-PANA-001-2024', 'CM-NCA-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (19, 'lt_battery_cell_cathode_material_1775472265881', 'BC-SK-001-2024', 'CM-NCM811-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (20, 'lt_battery_cell_cathode_material_1775472265881', 'BC-SVOLT-001-2024', 'CM-LFP-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (21, 'lt_battery_electrolyte_lithium_carbonate_17755655437902', 'EL-FD-001-2024', 'LC-BT-001-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (22, 'lt_battery_electrolyte_lithium_carbonate_17755655437902', 'EL-FD-002-2024', 'LC-BT-001-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (23, 'lt_battery_electrolyte_lithium_carbonate_17755655437902', 'EL-GL-001-2024', 'LC-BT-002-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (24, 'lt_battery_electrolyte_lithium_carbonate_17755655437902', 'EL-GL-002-2024', 'LC-BT-002-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (25, 'lt_battery_electrolyte_lithium_carbonate_17755655437902', 'EL-HT-001-2024', 'LC-BT-003-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (26, 'lt_battery_electrolyte_lithium_carbonate_17755655437902', 'EL-HV-001-2024', 'LC-IN-001-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (27, 'lt_battery_electrolyte_lithium_carbonate_17755655437902', 'EL-HV-002-2024', 'LC-IN-001-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (28, 'lt_battery_electrolyte_lithium_carbonate_17755655437902', 'EL-IN-001-2024', 'LC-IN-002-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (29, 'lt_battery_electrolyte_lithium_carbonate_17755655437902', 'EL-IN-002-2024', 'LC-IN-002-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (30, 'lt_battery_electrolyte_lithium_carbonate_17755655437902', 'EL-LP-001-2024', 'LC-ME-001-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (31, 'lt_battery_electrolyte_lithium_carbonate_17755655437902', 'EL-LP-002-2024', 'LC-ME-001-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (32, 'lt_battery_electrolyte_lithium_carbonate_17755655437902', 'EL-LP-003-2024', 'LC-ME-002-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (33, 'lt_battery_electrolyte_lithium_carbonate_17755655437902', 'EL-LT-001-2024', 'LC-BT-004-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (34, 'lt_battery_electrolyte_lithium_carbonate_17755655437902', 'EL-OR-001-2024', 'LC-BT-005-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (35, 'lt_battery_electrolyte_lithium_carbonate_17755655437902', 'EL-OR-002-2024', 'LC-BT-005-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (36, 'lt_battery_electrolyte_lithium_carbonate_17755655437902', 'EL-OR-003-2024', 'LC-IN-003-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (37, 'lt_battery_electrolyte_lithium_carbonate_17755655437902', 'EL-SI-001-2024', 'LC-ME-002-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (38, 'lt_battery_electrolyte_lithium_carbonate_17755655437902', 'EL-SS-001-2024', 'LC-BT-001-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (39, 'lt_battery_electrolyte_lithium_carbonate_17755655437902', 'EL-SS-002-2024', 'LC-BT-002-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (40, 'lt_battery_electrolyte_lithium_carbonate_17755655437902', 'EL-SS-003-2024', 'LC-BT-003-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (41, 'lt_cathode_material_lithium_carbonate_1775472267480', 'CM-LCO-2024', 'LC-BT-001-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (42, 'lt_cathode_material_lithium_carbonate_1775472267480', 'CM-LCO-2024', 'LC-IN-001-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (43, 'lt_cathode_material_lithium_carbonate_1775472267480', 'CM-LFMP-2024', 'LC-ME-001-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (44, 'lt_cathode_material_lithium_carbonate_1775472267480', 'CM-LFP-2024', 'LC-BT-002-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (45, 'lt_cathode_material_lithium_carbonate_1775472267480', 'CM-LFP-2024', 'LC-ME-002-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (46, 'lt_cathode_material_lithium_carbonate_1775472267480', 'CM-LFP-2024', 'LC-IN-002-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (47, 'lt_cathode_material_lithium_carbonate_1775472267480', 'CM-LMO-2024', 'LC-BT-003-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (48, 'lt_cathode_material_lithium_carbonate_1775472267480', 'CM-NCA-2024', 'LC-IN-003-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (49, 'lt_cathode_material_lithium_carbonate_1775472267480', 'CM-NCA-2024', 'LC-BT-004-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (50, 'lt_cathode_material_lithium_carbonate_1775472267480', 'CM-NCM523-2024', 'LC-BT-001-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (51, 'lt_cathode_material_lithium_carbonate_1775472267480', 'CM-NCM523-2024', 'LC-ME-001-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (52, 'lt_cathode_material_lithium_carbonate_1775472267480', 'CM-NCM622-2024', 'LC-IN-001-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (53, 'lt_cathode_material_lithium_carbonate_1775472267480', 'CM-NCM622-2024', 'LC-BT-002-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (54, 'lt_cathode_material_lithium_carbonate_1775472267480', 'CM-NCM712-2024', 'LC-ME-002-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (55, 'lt_cathode_material_lithium_carbonate_1775472267480', 'CM-NCM712-2024', 'LC-IN-003-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (56, 'lt_cathode_material_lithium_carbonate_1775472267480', 'CM-NCM811-2024', 'LC-BT-005-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (57, 'lt_cathode_material_lithium_carbonate_1775472267480', 'CM-NCM811-2024', 'LC-IN-002-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (58, 'lt_cathode_material_lithium_carbonate_1775472267480', 'CM-NCM811-2024', 'LC-ME-001-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (59, 'lt_cathode_material_lithium_carbonate_1775472267480', 'CM-NCM901-2024', 'LC-BT-004-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (60, 'lt_cathode_material_lithium_carbonate_1775472267480', 'CM-NCM901-2024', 'LC-IN-001-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (61, 'lt_cathode_material_lithium_carbonate_1775472267480', 'CM-NCM901-2024', 'LC-BT-005-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (62, 'lt_power_battery_battery_cell_1775472262897', 'BT-CATL-001-2024', 'BC-ATL-001-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (63, 'lt_power_battery_battery_cell_1775472262897', 'BT-CATL-001-2024', 'BC-ATL-002-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (64, 'lt_power_battery_battery_cell_1775472262897', 'BT-CATL-002-2024', 'BC-ATL-001-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (65, 'lt_power_battery_battery_cell_1775472262897', 'BT-CATL-003-2024', 'BC-ATL-002-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (66, 'lt_power_battery_battery_cell_1775472262897', 'BYD-BLADE-001-24', 'BC-BYD-001-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (67, 'lt_power_battery_battery_cell_1775472262897', 'BYD-BLADE-002-24', 'BC-BYD-001-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (68, 'lt_power_battery_battery_cell_1775472262897', 'CALB-LFP-001-2024', 'BC-CALB-001-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (69, 'lt_power_battery_battery_cell_1775472262897', 'CALB-NCM-001-2024', 'BC-CALB-001-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (70, 'lt_power_battery_battery_cell_1775472262897', 'EVE-LFP-001-2024', 'BC-EVE-001-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (71, 'lt_power_battery_battery_cell_1775472262897', 'EVE-NCM-001-2024', 'BC-EVE-001-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (72, 'lt_power_battery_battery_cell_1775472262897', 'GOTION-LFP-001-24', 'BC-ATL-001-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (73, 'lt_power_battery_battery_cell_1775472262897', 'GOTION-NCM-001-24', 'BC-LG-001-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (74, 'lt_power_battery_battery_cell_1775472262897', 'LGES-NCM-001-24', 'BC-LG-001-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (75, 'lt_power_battery_battery_cell_1775472262897', 'LGES-NCM-001-24', 'BC-LG-002-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (76, 'lt_power_battery_battery_cell_1775472262897', 'LGES-NCM-002-24', 'BC-LG-002-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (77, 'lt_power_battery_battery_cell_1775472262897', 'PANASONIC-001-24', 'BC-PANA-001-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (78, 'lt_power_battery_battery_cell_1775472262897', 'REPT-LFP-001-2024', 'BC-CALB-001-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (79, 'lt_power_battery_battery_cell_1775472262897', 'REPT-NCM-001-2024', 'BC-EVE-001-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (80, 'lt_power_battery_battery_cell_1775472262897', 'SKI-NCM-001-2024', 'BC-SK-001-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (81, 'lt_power_battery_battery_cell_1775472262897', 'SKI-NCM-002-24', 'BC-SK-001-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (82, 'lt_power_battery_battery_cell_1775472262897', 'SVOLT-LFP-001-24', 'BC-SVOLT-001-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (83, 'lt_power_battery_battery_cell_1775472262897', 'SVOLT-NCM-001-24', 'BC-SVOLT-001-2024', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (84, 'lt_power_battery_new_energy_vehicle_1775374603746', 'BT-CATL-001-2024', 'LHGCR1640J8100001', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (85, 'lt_power_battery_new_energy_vehicle_1775374603746', 'BT-CATL-002-2024', 'LHGCR1640J8100002', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (86, 'lt_power_battery_new_energy_vehicle_1775374603746', 'BT-CATL-003-2024', 'LHGCR1640J8100003', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (87, 'lt_power_battery_new_energy_vehicle_1775374603746', 'BYD-BLADE-001-24', 'LS5A2ABE9KA100001', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (88, 'lt_power_battery_new_energy_vehicle_1775374603746', 'BYD-BLADE-002-24', 'LS5A2ABE9KA100002', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (89, 'lt_power_battery_new_energy_vehicle_1775374603746', 'CALB-LFP-001-2024', 'LS5A2ABE9KA100003', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (90, 'lt_power_battery_new_energy_vehicle_1775374603746', 'CALB-NCM-001-2024', 'LS5A2ABE9KA100004', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (91, 'lt_power_battery_new_energy_vehicle_1775374603746', 'EVE-LFP-001-2024', 'LS5A2ABE9KA100005', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (92, 'lt_power_battery_new_energy_vehicle_1775374603746', 'EVE-NCM-001-2024', 'LS5A2ABE9KA100006', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (93, 'lt_power_battery_new_energy_vehicle_1775374603746', 'GOTION-LFP-001-24', 'LS5A2ABE9KA100007', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (94, 'lt_power_battery_new_energy_vehicle_1775374603746', 'GOTION-NCM-001-24', 'LS5A2ABE9KA100008', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (95, 'lt_power_battery_new_energy_vehicle_1775374603746', 'LGES-NCM-001-24', 'LSVAG2180J2100001', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (96, 'lt_power_battery_new_energy_vehicle_1775374603746', 'LGES-NCM-002-24', 'LSVAG2180J2100002', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (97, 'lt_power_battery_new_energy_vehicle_1775374603746', 'PANASONIC-001-24', 'LVGBE40K9LG100001', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (98, 'lt_power_battery_new_energy_vehicle_1775374603746', 'REPT-LFP-001-2024', 'LVGBE40K9LG100002', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (99, 'lt_power_battery_new_energy_vehicle_1775374603746', 'REPT-NCM-001-2024', 'LVGBE40K9LG100003', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (100, 'lt_power_battery_new_energy_vehicle_1775374603746', 'SKI-NCM-001-2024', 'LHGCR1640J8100004', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (101, 'lt_power_battery_new_energy_vehicle_1775374603746', 'SKI-NCM-002-24', 'LHGCR1640J8100005', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (102, 'lt_power_battery_new_energy_vehicle_1775374603746', 'SVOLT-LFP-001-24', 'LHGCR1640J8100006', '2026-04-09 08:09:47');
INSERT INTO `link_instance_data` (`id`, `link_type_id`, `source_instance_id`, `target_instance_id`, `created_at`) VALUES (103, 'lt_power_battery_new_energy_vehicle_1775374603746', 'SVOLT-NCM-001-24', 'LS5A2ABE9KA100001', '2026-04-09 08:09:47');
COMMIT;

-- ----------------------------
-- Table structure for link_types
-- ----------------------------
DROP TABLE IF EXISTS `link_types`;
CREATE TABLE `link_types` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `source_object_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_object_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cardinality` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'N:M',
  `description` text COLLATE utf8mb4_unicode_ci,
  `industry_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `source_column` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '源对象类型唯一标识列（对应底层数据表字段）',
  `target_column` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '目标对象类型唯一标识列（对应底层数据表字段）',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of link_types
-- ----------------------------
BEGIN;
INSERT INTO `link_types` (`id`, `name`, `source_object_id`, `target_object_id`, `cardinality`, `description`, `industry_id`, `created_at`, `updated_at`, `source_column`, `target_column`) VALUES ('lt_battery_cell_battery_electrolyte_1775655447785', '使用电解液', 'battery_cell', 'battery_electrolyte', 'N:1', '电芯的生产需要使用特定的电解液，电解液的类型和价格影响电芯的性能和成本', NULL, '2026-04-08 21:37:27', '2026-04-09 08:00:55', 'unique_id', 'unique_id');
INSERT INTO `link_types` (`id`, `name`, `source_object_id`, `target_object_id`, `cardinality`, `description`, `industry_id`, `created_at`, `updated_at`, `source_column`, `target_column`) VALUES ('lt_battery_cell_cathode_material_1775472265881', '电芯使用正极材料', 'battery_cell', 'cathode_material', 'N:1', '电芯的制造需要使用特定的正极材料（如磷酸铁锂、三元材料等），同一种正极材料可用于多种电芯。', NULL, '2026-04-06 18:44:25', '2026-04-09 08:01:38', 'unique_id', 'material_id');
INSERT INTO `link_types` (`id`, `name`, `source_object_id`, `target_object_id`, `cardinality`, `description`, `industry_id`, `created_at`, `updated_at`, `source_column`, `target_column`) VALUES ('lt_battery_electrolyte_lithium_carbonate_1775655437902', '原料包含碳酸锂', 'battery_electrolyte', 'lithium_carbonate', 'N:1', '电解液（特别是锂离子电池电解液）的生产需要使用碳酸锂作为锂源，碳酸锂的价格影响电解液成本', NULL, '2026-04-08 21:37:17', '2026-04-09 08:01:11', 'unique_id', 'unique_id');
INSERT INTO `link_types` (`id`, `name`, `source_object_id`, `target_object_id`, `cardinality`, `description`, `industry_id`, `created_at`, `updated_at`, `source_column`, `target_column`) VALUES ('lt_cathode_material_lithium_carbonate_1775472267480', '正极材料消耗碳酸锂', 'cathode_material', 'lithium_carbonate', 'N:M', '正极材料的生产需要消耗碳酸锂作为关键锂源，而碳酸锂也可用于生产多种不同的正极材料。', NULL, '2026-04-06 18:44:27', '2026-04-09 08:01:20', 'material_id', 'unique_id');
INSERT INTO `link_types` (`id`, `name`, `source_object_id`, `target_object_id`, `cardinality`, `description`, `industry_id`, `created_at`, `updated_at`, `source_column`, `target_column`) VALUES ('lt_power_battery_battery_cell_1775472262897', '电池由电芯组成', 'power_battery', 'battery_cell', '1:N', '一个动力电池包（电池）由多个基本的电芯通过串并联方式组合而成。', NULL, '2026-04-06 18:44:22', '2026-04-09 08:01:30', 'unique_id', 'unique_id');
INSERT INTO `link_types` (`id`, `name`, `source_object_id`, `target_object_id`, `cardinality`, `description`, `industry_id`, `created_at`, `updated_at`, `source_column`, `target_column`) VALUES ('lt_power_battery_new_energy_vehicle_1775374603746', '装配于', 'power_battery', 'new_energy_vehicle', 'N:1', '电池作为核心部件被装配到新能源整车中', NULL, '2026-04-05 15:36:43', '2026-04-09 08:01:47', 'unique_id', 'vehicle_id');
COMMIT;

-- ----------------------------
-- Table structure for lithium_carbonate
-- ----------------------------
DROP TABLE IF EXISTS `lithium_carbonate`;
CREATE TABLE `lithium_carbonate` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '自增主键ID',
  `unique_id` varchar(100) NOT NULL COMMENT '唯一标识符，如产品编码或批次号',
  `grade` varchar(50) DEFAULT NULL COMMENT '品级，如电池级、工业级、医药级',
  `manufacturer` varchar(100) DEFAULT NULL COMMENT '生产厂家或供应商名称',
  `price` decimal(12,2) DEFAULT NULL COMMENT '价格（万元/吨）',
  `price_date` date DEFAULT NULL COMMENT '价格日期',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_id` (`unique_id`),
  KEY `idx_unique_id` (`unique_id`),
  KEY `idx_grade` (`grade`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='碳酸锂信息表';

-- ----------------------------
-- Records of lithium_carbonate
-- ----------------------------
BEGIN;
INSERT INTO `lithium_carbonate` (`id`, `unique_id`, `grade`, `manufacturer`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (1, 'LC-BT-001-2024', '电池级', '天齐锂业', 12.50, '2024-03-01', '2026-04-08 20:52:27', '2026-04-08 20:52:27');
INSERT INTO `lithium_carbonate` (`id`, `unique_id`, `grade`, `manufacturer`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (2, 'LC-BT-002-2024', '电池级', '赣锋锂业', 12.80, '2024-03-01', '2026-04-08 20:52:27', '2026-04-08 20:52:27');
INSERT INTO `lithium_carbonate` (`id`, `unique_id`, `grade`, `manufacturer`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (3, 'LC-BT-003-2024', '电池级', '盐湖股份', 11.20, '2024-02-15', '2026-04-08 20:52:27', '2026-04-08 20:52:27');
INSERT INTO `lithium_carbonate` (`id`, `unique_id`, `grade`, `manufacturer`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (4, 'LC-BT-004-2024', '电池级', '雅化集团', 13.20, '2024-03-10', '2026-04-08 20:52:27', '2026-04-08 20:52:27');
INSERT INTO `lithium_carbonate` (`id`, `unique_id`, `grade`, `manufacturer`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (5, 'LC-IN-001-2024', '工业级', '天齐锂业', 9.80, '2024-01-20', '2026-04-08 20:52:27', '2026-04-08 20:52:27');
INSERT INTO `lithium_carbonate` (`id`, `unique_id`, `grade`, `manufacturer`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (6, 'LC-IN-002-2024', '工业级', '赣锋锂业', 10.20, '2024-02-28', '2026-04-08 20:52:27', '2026-04-08 20:52:27');
INSERT INTO `lithium_carbonate` (`id`, `unique_id`, `grade`, `manufacturer`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (7, 'LC-IN-003-2024', '工业级', '西藏矿业', 9.50, '2024-03-05', '2026-04-08 20:52:27', '2026-04-08 20:52:27');
INSERT INTO `lithium_carbonate` (`id`, `unique_id`, `grade`, `manufacturer`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (8, 'LC-ME-001-2024', '医药级', '天齐锂业', 18.50, '2024-01-15', '2026-04-08 20:52:27', '2026-04-08 20:52:27');
INSERT INTO `lithium_carbonate` (`id`, `unique_id`, `grade`, `manufacturer`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (9, 'LC-ME-002-2024', '医药级', '赣锋锂业', 19.20, '2024-03-12', '2026-04-08 20:52:27', '2026-04-08 20:52:27');
INSERT INTO `lithium_carbonate` (`id`, `unique_id`, `grade`, `manufacturer`, `price`, `price_date`, `created_at`, `updated_at`) VALUES (10, 'LC-BT-005-2024', '电池级', '盛新锂能', 12.60, '2024-02-22', '2026-04-08 20:52:27', '2026-04-08 20:52:27');
COMMIT;

-- ----------------------------
-- Table structure for new_energy_vehicle
-- ----------------------------
DROP TABLE IF EXISTS `new_energy_vehicle`;
CREATE TABLE `new_energy_vehicle` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '自增主键ID',
  `vehicle_id` varchar(50) NOT NULL COMMENT '车辆唯一标识符（VIN码）',
  `brand` varchar(100) DEFAULT NULL COMMENT '品牌',
  `model_name` varchar(200) DEFAULT NULL COMMENT '车型名称',
  `vehicle_type` varchar(50) DEFAULT NULL COMMENT '车辆类型（如：纯电动BEV、插电混动PHEV、增程式EREV）',
  `battery_capacity` decimal(10,2) DEFAULT NULL COMMENT '电池容量（单位：kWh）',
  `range_km` int DEFAULT NULL COMMENT '续航里程（单位：公里）',
  `price` decimal(12,2) DEFAULT NULL COMMENT '指导价（单位：万元）',
  `production_date` date DEFAULT NULL COMMENT '生产日期',
  `is_available` tinyint(1) DEFAULT '1' COMMENT '是否在售',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `price_date` date DEFAULT NULL COMMENT '价格日期',
  `initial_gross_margin` decimal(10,4) DEFAULT NULL COMMENT '初始毛利率',
  `initial_cost` decimal(12,2) DEFAULT NULL COMMENT '初始成本（单位：万元）',
  `battery_cost` decimal(12,2) DEFAULT NULL COMMENT '电池成本（单位：万元）',
  PRIMARY KEY (`id`),
  KEY `idx_vehicle_id` (`vehicle_id`),
  KEY `idx_brand` (`brand`),
  KEY `idx_vehicle_type` (`vehicle_type`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='新能源汽车信息表';

-- ----------------------------
-- Records of new_energy_vehicle
-- ----------------------------
BEGIN;
INSERT INTO `new_energy_vehicle` (`id`, `vehicle_id`, `brand`, `model_name`, `vehicle_type`, `battery_capacity`, `range_km`, `price`, `production_date`, `is_available`, `created_at`, `updated_at`, `price_date`, `initial_gross_margin`, `initial_cost`, `battery_cost`) VALUES (1, 'LSVAG2180J2100001', '特斯拉', 'Model 3 标准续航版', '纯电动BEV', 60.00, 556, 23.19, '2024-01-15', 1, '2026-04-05 19:35:41', '2026-04-08 19:57:41', '2024-03-01', 0.1520, 18.50, 6.20);
INSERT INTO `new_energy_vehicle` (`id`, `vehicle_id`, `brand`, `model_name`, `vehicle_type`, `battery_capacity`, `range_km`, `price`, `production_date`, `is_available`, `created_at`, `updated_at`, `price_date`, `initial_gross_margin`, `initial_cost`, `battery_cost`) VALUES (2, 'LSVAG2180J2100002', '特斯拉', 'Model Y 长续航版', '纯电动BEV', 78.40, 660, 29.99, '2024-02-20', 1, '2026-04-05 19:35:41', '2026-04-08 19:57:41', '2024-03-01', 0.1850, 22.80, 8.50);
INSERT INTO `new_energy_vehicle` (`id`, `vehicle_id`, `brand`, `model_name`, `vehicle_type`, `battery_capacity`, `range_km`, `price`, `production_date`, `is_available`, `created_at`, `updated_at`, `price_date`, `initial_gross_margin`, `initial_cost`, `battery_cost`) VALUES (3, 'LVGBE40K9LG100001', '比亚迪', '汉EV 冠军版', '纯电动BEV', 85.40, 715, 20.98, '2024-03-10', 1, '2026-04-05 19:35:41', '2026-04-08 19:57:41', '2024-02-15', 0.1250, 16.80, 7.20);
INSERT INTO `new_energy_vehicle` (`id`, `vehicle_id`, `brand`, `model_name`, `vehicle_type`, `battery_capacity`, `range_km`, `price`, `production_date`, `is_available`, `created_at`, `updated_at`, `price_date`, `initial_gross_margin`, `initial_cost`, `battery_cost`) VALUES (4, 'LVGBE40K9LG100002', '比亚迪', '海豹 700km', '纯电动BEV', 82.50, 700, 22.28, '2024-01-08', 1, '2026-04-05 19:35:41', '2026-04-08 19:57:41', '2024-02-15', 0.1420, 17.50, 7.80);
INSERT INTO `new_energy_vehicle` (`id`, `vehicle_id`, `brand`, `model_name`, `vehicle_type`, `battery_capacity`, `range_km`, `price`, `production_date`, `is_available`, `created_at`, `updated_at`, `price_date`, `initial_gross_margin`, `initial_cost`, `battery_cost`) VALUES (5, 'LVGBE40K9LG100003', '比亚迪', '秦PLUS DM-i', '插电混动PHEV', 18.30, 1245, 9.98, '2024-02-15', 1, '2026-04-05 19:35:41', '2026-04-08 19:57:41', '2024-01-20', 0.0980, 8.20, 2.80);
INSERT INTO `new_energy_vehicle` (`id`, `vehicle_id`, `brand`, `model_name`, `vehicle_type`, `battery_capacity`, `range_km`, `price`, `production_date`, `is_available`, `created_at`, `updated_at`, `price_date`, `initial_gross_margin`, `initial_cost`, `battery_cost`) VALUES (6, 'LVGBE40K9LG100004', '比亚迪', '宋PLUS DM-i', '插电混动PHEV', 26.60, 1200, 15.48, '2024-03-22', 1, '2026-04-05 19:35:41', '2026-04-08 19:57:41', '2024-01-20', 0.1150, 12.50, 4.20);
INSERT INTO `new_energy_vehicle` (`id`, `vehicle_id`, `brand`, `model_name`, `vehicle_type`, `battery_capacity`, `range_km`, `price`, `production_date`, `is_available`, `created_at`, `updated_at`, `price_date`, `initial_gross_margin`, `initial_cost`, `battery_cost`) VALUES (7, 'LHGCR1640J8100001', '蔚来', 'ET5 75kWh', '纯电动BEV', 75.00, 560, 29.80, '2024-01-20', 1, '2026-04-05 19:35:41', '2026-04-08 19:57:41', '2024-03-10', 0.1650, 21.20, 8.80);
INSERT INTO `new_energy_vehicle` (`id`, `vehicle_id`, `brand`, `model_name`, `vehicle_type`, `battery_capacity`, `range_km`, `price`, `production_date`, `is_available`, `created_at`, `updated_at`, `price_date`, `initial_gross_margin`, `initial_cost`, `battery_cost`) VALUES (8, 'LHGCR1640J8100002', '蔚来', 'ES6 100kWh', '纯电动BEV', 100.00, 625, 39.60, '2024-02-28', 1, '2026-04-05 19:35:41', '2026-04-08 19:57:41', '2024-03-10', 0.1980, 28.50, 11.20);
INSERT INTO `new_energy_vehicle` (`id`, `vehicle_id`, `brand`, `model_name`, `vehicle_type`, `battery_capacity`, `range_km`, `price`, `production_date`, `is_available`, `created_at`, `updated_at`, `price_date`, `initial_gross_margin`, `initial_cost`, `battery_cost`) VALUES (9, 'LHGCR1640J8100003', '小鹏', 'P7i 702 Max', '纯电动BEV', 86.20, 702, 23.99, '2024-03-05', 1, '2026-04-05 19:35:41', '2026-04-08 19:57:41', '2024-02-28', 0.1380, 18.20, 7.50);
INSERT INTO `new_energy_vehicle` (`id`, `vehicle_id`, `brand`, `model_name`, `vehicle_type`, `battery_capacity`, `range_km`, `price`, `production_date`, `is_available`, `created_at`, `updated_at`, `price_date`, `initial_gross_margin`, `initial_cost`, `battery_cost`) VALUES (10, 'LHGCR1640J8100004', '小鹏', 'G9 702 Pro', '纯电动BEV', 98.00, 702, 32.99, '2024-01-12', 1, '2026-04-05 19:35:41', '2026-04-08 19:57:41', '2024-02-28', 0.1750, 24.80, 9.80);
INSERT INTO `new_energy_vehicle` (`id`, `vehicle_id`, `brand`, `model_name`, `vehicle_type`, `battery_capacity`, `range_km`, `price`, `production_date`, `is_available`, `created_at`, `updated_at`, `price_date`, `initial_gross_margin`, `initial_cost`, `battery_cost`) VALUES (11, 'LHGCR1640J8100005', '理想', 'L7 Pro', '增程式EREV', 42.80, 1315, 33.98, '2024-02-18', 1, '2026-04-05 19:35:41', '2026-04-08 19:58:11', '2024-01-15', 0.1280, 26.80, 10.50);
INSERT INTO `new_energy_vehicle` (`id`, `vehicle_id`, `brand`, `model_name`, `vehicle_type`, `battery_capacity`, `range_km`, `price`, `production_date`, `is_available`, `created_at`, `updated_at`, `price_date`, `initial_gross_margin`, `initial_cost`, `battery_cost`) VALUES (12, 'LHGCR1640J8100006', '理想', 'L9 Max', '增程式EREV', 52.30, 1412, 45.98, '2024-03-15', 1, '2026-04-05 19:35:41', '2026-04-08 19:58:11', '2024-01-15', 0.1580, 32.50, 12.80);
INSERT INTO `new_energy_vehicle` (`id`, `vehicle_id`, `brand`, `model_name`, `vehicle_type`, `battery_capacity`, `range_km`, `price`, `production_date`, `is_available`, `created_at`, `updated_at`, `price_date`, `initial_gross_margin`, `initial_cost`, `battery_cost`) VALUES (13, 'LS5A2ABE9KA100001', '广汽埃安', 'AION S Plus', '纯电动BEV', 69.90, 610, 14.98, '2024-01-25', 1, '2026-04-05 19:35:41', '2026-04-08 19:58:11', '2024-03-05', 0.0950, 12.20, 5.20);
INSERT INTO `new_energy_vehicle` (`id`, `vehicle_id`, `brand`, `model_name`, `vehicle_type`, `battery_capacity`, `range_km`, `price`, `production_date`, `is_available`, `created_at`, `updated_at`, `price_date`, `initial_gross_margin`, `initial_cost`, `battery_cost`) VALUES (14, 'LS5A2ABE9KA100002', '广汽埃安', 'AION Y Plus', '纯电动BEV', 76.80, 610, 13.18, '2024-02-10', 1, '2026-04-05 19:35:41', '2026-04-08 19:58:11', '2024-03-05', 0.0880, 10.80, 4.80);
INSERT INTO `new_energy_vehicle` (`id`, `vehicle_id`, `brand`, `model_name`, `vehicle_type`, `battery_capacity`, `range_km`, `price`, `production_date`, `is_available`, `created_at`, `updated_at`, `price_date`, `initial_gross_margin`, `initial_cost`, `battery_cost`) VALUES (15, 'LS5A2ABE9KA100003', '极氪', '001 WE版', '纯电动BEV', 100.00, 741, 30.00, '2024-03-08', 1, '2026-04-05 19:35:41', '2026-04-08 19:58:11', '2024-02-22', 0.1680, 22.50, 9.20);
INSERT INTO `new_energy_vehicle` (`id`, `vehicle_id`, `brand`, `model_name`, `vehicle_type`, `battery_capacity`, `range_km`, `price`, `production_date`, `is_available`, `created_at`, `updated_at`, `price_date`, `initial_gross_margin`, `initial_cost`, `battery_cost`) VALUES (16, 'LS5A2ABE9KA100004', '极氪', '007 后驱版', '纯电动BEV', 75.60, 688, 20.99, '2024-01-30', 1, '2026-04-05 19:35:41', '2026-04-08 19:58:11', '2024-02-22', 0.1450, 16.20, 6.80);
INSERT INTO `new_energy_vehicle` (`id`, `vehicle_id`, `brand`, `model_name`, `vehicle_type`, `battery_capacity`, `range_km`, `price`, `production_date`, `is_available`, `created_at`, `updated_at`, `price_date`, `initial_gross_margin`, `initial_cost`, `battery_cost`) VALUES (17, 'LS5A2ABE9KA100005', '问界', 'M5 EV 后驱', '纯电动BEV', 80.00, 620, 25.98, '2024-02-25', 1, '2026-04-05 19:35:41', '2026-04-08 19:58:11', '2024-03-12', 0.1320, 20.50, 8.20);
INSERT INTO `new_energy_vehicle` (`id`, `vehicle_id`, `brand`, `model_name`, `vehicle_type`, `battery_capacity`, `range_km`, `price`, `production_date`, `is_available`, `created_at`, `updated_at`, `price_date`, `initial_gross_margin`, `initial_cost`, `battery_cost`) VALUES (18, 'LS5A2ABE9KA100006', '问界', 'M7 增程版', '增程式EREV', 40.00, 1300, 28.98, '2024-03-20', 1, '2026-04-05 19:35:41', '2026-04-08 19:58:11', '2024-03-12', 0.1480, 22.80, 8.80);
INSERT INTO `new_energy_vehicle` (`id`, `vehicle_id`, `brand`, `model_name`, `vehicle_type`, `battery_capacity`, `range_km`, `price`, `production_date`, `is_available`, `created_at`, `updated_at`, `price_date`, `initial_gross_margin`, `initial_cost`, `battery_cost`) VALUES (19, 'LS5A2ABE9KA100007', '长安深蓝', 'SL03 增程版', '增程式EREV', 28.39, 1200, 14.99, '2024-01-18', 1, '2026-04-05 19:35:41', '2026-04-08 19:58:11', '2024-02-08', 0.1050, 11.80, 4.50);
INSERT INTO `new_energy_vehicle` (`id`, `vehicle_id`, `brand`, `model_name`, `vehicle_type`, `battery_capacity`, `range_km`, `price`, `production_date`, `is_available`, `created_at`, `updated_at`, `price_date`, `initial_gross_margin`, `initial_cost`, `battery_cost`) VALUES (20, 'LS5A2ABE9KA100008', '长安深蓝', 'S7 纯电版', '纯电动BEV', 79.97, 620, 18.99, '2024-02-22', 1, '2026-04-05 19:35:41', '2026-04-08 19:58:11', '2024-02-08', 0.1180, 14.50, 6.20);
COMMIT;

-- ----------------------------
-- Table structure for object_types
-- ----------------------------
DROP TABLE IF EXISTS `object_types`;
CREATE TABLE `object_types` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `icon` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Database',
  `backing_dataset` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `industry_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `data_source` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'mysql' COMMENT '数据源名称',
  `database_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'ontology' COMMENT '数据库名称',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of object_types
-- ----------------------------
BEGIN;
INSERT INTO `object_types` (`id`, `name`, `description`, `icon`, `backing_dataset`, `industry_id`, `created_at`, `updated_at`, `data_source`, `database_name`) VALUES ('battery_cell', '电芯', '电芯', 'Database', 'battery_cell', NULL, '2026-04-06 18:28:04', '2026-04-06 18:28:04', 'mysql', 'ontology');
INSERT INTO `object_types` (`id`, `name`, `description`, `icon`, `backing_dataset`, `industry_id`, `created_at`, `updated_at`, `data_source`, `database_name`) VALUES ('battery_electrolyte', '电池电解液', '电池电解液', 'Database', 'battery_electrolyte', NULL, '2026-04-08 20:13:52', '2026-04-08 20:13:52', 'mysql', 'ontology');
INSERT INTO `object_types` (`id`, `name`, `description`, `icon`, `backing_dataset`, `industry_id`, `created_at`, `updated_at`, `data_source`, `database_name`) VALUES ('cathode_material', '正极材料', '正极材料', 'Database', 'cathode_material', NULL, '2026-04-06 18:30:29', '2026-04-06 18:30:29', 'mysql', 'ontology');
INSERT INTO `object_types` (`id`, `name`, `description`, `icon`, `backing_dataset`, `industry_id`, `created_at`, `updated_at`, `data_source`, `database_name`) VALUES ('lithium_carbonate', '碳酸锂', '碳酸锂', 'Database', 'lithium_carbonate', NULL, '2026-04-06 18:34:31', '2026-04-06 18:34:31', 'mysql', 'ontology');
INSERT INTO `object_types` (`id`, `name`, `description`, `icon`, `backing_dataset`, `industry_id`, `created_at`, `updated_at`, `data_source`, `database_name`) VALUES ('new_energy_vehicle', '新能源整车', '新能源整车', 'Database', 'new_energy_vehicle', NULL, '2026-04-05 15:07:20', '2026-04-05 15:15:50', 'mysql', 'ontology');
INSERT INTO `object_types` (`id`, `name`, `description`, `icon`, `backing_dataset`, `industry_id`, `created_at`, `updated_at`, `data_source`, `database_name`) VALUES ('power_battery', '电池', '电池', 'Database', 'power_battery', NULL, '2026-04-05 15:25:19', '2026-04-05 15:25:19', 'mysql', 'ontology');
COMMIT;

-- ----------------------------
-- Table structure for power_battery
-- ----------------------------
DROP TABLE IF EXISTS `power_battery`;
CREATE TABLE `power_battery` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '自增主键ID',
  `unique_id` varchar(100) NOT NULL COMMENT '电池的唯一标识符',
  `model` varchar(100) DEFAULT NULL COMMENT '电池型号',
  `capacity` decimal(10,2) DEFAULT NULL COMMENT '电池容量，单位通常为安时(Ah)或毫安时(mAh)',
  `voltage` decimal(10,2) DEFAULT NULL COMMENT '额定电压，单位伏特(V)',
  `chemistry` varchar(50) DEFAULT NULL COMMENT '电池化学类型，如锂离子、铅酸、镍氢等',
  `manufacturer` varchar(100) DEFAULT NULL COMMENT '制造商名称',
  `production_date` date DEFAULT NULL COMMENT '生产日期',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `price` decimal(10,2) DEFAULT NULL COMMENT '电池价格（单位：元）',
  `price_date` date DEFAULT NULL COMMENT '价格日期',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_id` (`unique_id`),
  KEY `idx_unique_id` (`unique_id`),
  KEY `idx_model` (`model`),
  KEY `idx_manufacturer` (`manufacturer`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='动力电池信息表';

-- ----------------------------
-- Records of power_battery
-- ----------------------------
BEGIN;
INSERT INTO `power_battery` (`id`, `unique_id`, `model`, `capacity`, `voltage`, `chemistry`, `manufacturer`, `production_date`, `created_at`, `updated_at`, `price`, `price_date`) VALUES (1, 'BT-CATL-001-2024', 'NCM811-150Ah', 150.00, 3.70, '锂离子', '宁德时代', '2024-01-15', '2026-04-06 17:58:18', '2026-04-08 23:00:47', 85000.00, '2024-03-15');
INSERT INTO `power_battery` (`id`, `unique_id`, `model`, `capacity`, `voltage`, `chemistry`, `manufacturer`, `production_date`, `created_at`, `updated_at`, `price`, `price_date`) VALUES (2, 'BT-CATL-002-2024', 'NCM523-120Ah', 120.00, 3.65, '锂离子', '宁德时代', '2024-02-20', '2026-04-06 17:58:18', '2026-04-08 23:00:47', 72000.00, '2024-03-15');
INSERT INTO `power_battery` (`id`, `unique_id`, `model`, `capacity`, `voltage`, `chemistry`, `manufacturer`, `production_date`, `created_at`, `updated_at`, `price`, `price_date`) VALUES (3, 'BT-CATL-003-2024', 'LFP-280Ah', 280.00, 3.20, '磷酸铁锂', '宁德时代', '2024-03-10', '2026-04-06 17:58:18', '2026-04-08 23:00:47', 65000.00, '2024-03-15');
INSERT INTO `power_battery` (`id`, `unique_id`, `model`, `capacity`, `voltage`, `chemistry`, `manufacturer`, `production_date`, `created_at`, `updated_at`, `price`, `price_date`) VALUES (4, 'BYD-BLADE-001-24', '刀片电池-135Ah', 135.00, 3.20, '磷酸铁锂', '比亚迪', '2024-01-08', '2026-04-06 17:58:18', '2026-04-08 23:00:47', 68000.00, '2024-03-10');
INSERT INTO `power_battery` (`id`, `unique_id`, `model`, `capacity`, `voltage`, `chemistry`, `manufacturer`, `production_date`, `created_at`, `updated_at`, `price`, `price_date`) VALUES (5, 'BYD-BLADE-002-24', '刀片电池-172Ah', 172.00, 3.20, '磷酸铁锂', '比亚迪', '2024-02-15', '2026-04-06 17:58:18', '2026-04-08 23:00:47', 82000.00, '2024-03-10');
INSERT INTO `power_battery` (`id`, `unique_id`, `model`, `capacity`, `voltage`, `chemistry`, `manufacturer`, `production_date`, `created_at`, `updated_at`, `price`, `price_date`) VALUES (6, 'LGES-NCM-001-24', 'NCM712-78Ah', 78.00, 3.70, '锂离子', 'LG新能源', '2024-01-20', '2026-04-06 17:58:18', '2026-04-08 23:00:47', 95000.00, '2024-03-12');
INSERT INTO `power_battery` (`id`, `unique_id`, `model`, `capacity`, `voltage`, `chemistry`, `manufacturer`, `production_date`, `created_at`, `updated_at`, `price`, `price_date`) VALUES (7, 'LGES-NCM-002-24', 'NCM622-60Ah', 60.00, 3.65, '锂离子', 'LG新能源', '2024-02-28', '2026-04-06 17:58:18', '2026-04-08 23:00:47', 78000.00, '2024-03-12');
INSERT INTO `power_battery` (`id`, `unique_id`, `model`, `capacity`, `voltage`, `chemistry`, `manufacturer`, `production_date`, `created_at`, `updated_at`, `price`, `price_date`) VALUES (8, 'SKI-NCM-001-2024', 'NCM811-88Ah', 88.00, 3.70, '锂离子', 'SK创新', '2024-03-05', '2026-04-06 17:58:18', '2026-04-08 23:00:47', 88000.00, '2024-03-08');
INSERT INTO `power_battery` (`id`, `unique_id`, `model`, `capacity`, `voltage`, `chemistry`, `manufacturer`, `production_date`, `created_at`, `updated_at`, `price`, `price_date`) VALUES (9, 'SKI-NCM-002-2024', 'NCM622-70Ah', 70.00, 3.65, '锂离子', 'SK创新', '2024-01-12', '2026-04-06 17:58:18', '2026-04-08 23:00:47', 75000.00, '2024-03-08');
INSERT INTO `power_battery` (`id`, `unique_id`, `model`, `capacity`, `voltage`, `chemistry`, `manufacturer`, `production_date`, `created_at`, `updated_at`, `price`, `price_date`) VALUES (10, 'SVOLT-NCM-001-24', 'NCM811-95Ah', 95.00, 3.70, '锂离子', '蜂巢能源', '2024-02-18', '2026-04-06 17:58:18', '2026-04-08 23:00:47', 80000.00, '2024-03-14');
INSERT INTO `power_battery` (`id`, `unique_id`, `model`, `capacity`, `voltage`, `chemistry`, `manufacturer`, `production_date`, `created_at`, `updated_at`, `price`, `price_date`) VALUES (11, 'SVOLT-LFP-001-24', 'LFP-202Ah', 202.00, 3.20, '磷酸铁锂', '蜂巢能源', '2024-03-15', '2026-04-06 17:58:18', '2026-04-08 23:01:06', 62000.00, '2024-03-14');
INSERT INTO `power_battery` (`id`, `unique_id`, `model`, `capacity`, `voltage`, `chemistry`, `manufacturer`, `production_date`, `created_at`, `updated_at`, `price`, `price_date`) VALUES (12, 'CALB-NCM-001-2024', 'NCM523-110Ah', 110.00, 3.65, '锂离子', '中创新航', '2024-01-25', '2026-04-06 17:58:18', '2026-04-08 23:01:06', 70000.00, '2024-03-11');
INSERT INTO `power_battery` (`id`, `unique_id`, `model`, `capacity`, `voltage`, `chemistry`, `manufacturer`, `production_date`, `created_at`, `updated_at`, `price`, `price_date`) VALUES (13, 'CALB-LFP-001-2024', 'LFP-230Ah', 230.00, 3.20, '磷酸铁锂', '中创新航', '2024-02-10', '2026-04-06 17:58:18', '2026-04-08 23:01:06', 58000.00, '2024-03-11');
INSERT INTO `power_battery` (`id`, `unique_id`, `model`, `capacity`, `voltage`, `chemistry`, `manufacturer`, `production_date`, `created_at`, `updated_at`, `price`, `price_date`) VALUES (14, 'EVE-NCM-001-2024', 'NCM811-105Ah', 105.00, 3.70, '锂离子', '亿纬锂能', '2024-03-08', '2026-04-06 17:58:18', '2026-04-08 23:01:06', 82000.00, '2024-03-13');
INSERT INTO `power_battery` (`id`, `unique_id`, `model`, `capacity`, `voltage`, `chemistry`, `manufacturer`, `production_date`, `created_at`, `updated_at`, `price`, `price_date`) VALUES (15, 'EVE-LFP-001-2024', 'LFP-304Ah', 304.00, 3.20, '磷酸铁锂', '亿纬锂能', '2024-01-30', '2026-04-06 17:58:18', '2026-04-08 23:01:06', 60000.00, '2024-03-13');
INSERT INTO `power_battery` (`id`, `unique_id`, `model`, `capacity`, `voltage`, `chemistry`, `manufacturer`, `production_date`, `created_at`, `updated_at`, `price`, `price_date`) VALUES (16, 'GOTION-NCM-001-24', 'NCM523-90Ah', 90.00, 3.65, '锂离子', '国轩高科', '2024-02-25', '2026-04-06 17:58:18', '2026-04-08 23:01:06', 66000.00, '2024-03-09');
INSERT INTO `power_battery` (`id`, `unique_id`, `model`, `capacity`, `voltage`, `chemistry`, `manufacturer`, `production_date`, `created_at`, `updated_at`, `price`, `price_date`) VALUES (17, 'GOTION-LFP-001-24', 'LFP-210Ah', 210.00, 3.20, '磷酸铁锂', '国轩高科', '2024-03-20', '2026-04-06 17:58:18', '2026-04-08 23:01:06', 55000.00, '2024-03-09');
INSERT INTO `power_battery` (`id`, `unique_id`, `model`, `capacity`, `voltage`, `chemistry`, `manufacturer`, `production_date`, `created_at`, `updated_at`, `price`, `price_date`) VALUES (18, 'REPT-NCM-001-2024', 'NCM622-115Ah', 115.00, 3.65, '锂离子', '瑞浦兰钧', '2024-01-18', '2026-04-06 17:58:18', '2026-04-08 23:01:06', 71000.00, '2024-03-16');
INSERT INTO `power_battery` (`id`, `unique_id`, `model`, `capacity`, `voltage`, `chemistry`, `manufacturer`, `production_date`, `created_at`, `updated_at`, `price`, `price_date`) VALUES (19, 'REPT-LFP-001-2024', 'LFP-280Ah', 280.00, 3.20, '磷酸铁锂', '瑞浦兰钧', '2024-02-22', '2026-04-06 17:58:18', '2026-04-08 23:01:06', 59000.00, '2024-03-16');
INSERT INTO `power_battery` (`id`, `unique_id`, `model`, `capacity`, `voltage`, `chemistry`, `manufacturer`, `production_date`, `created_at`, `updated_at`, `price`, `price_date`) VALUES (20, 'PANASONIC-001-24', 'NCA-3400mAh', 3.40, 3.60, '镍钴铝', '松下', '2024-03-12', '2026-04-06 17:58:18', '2026-04-08 23:01:06', 120000.00, '2024-03-07');
COMMIT;

-- ----------------------------
-- Table structure for properties
-- ----------------------------
DROP TABLE IF EXISTS `properties`;
CREATE TABLE `properties` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `object_type_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'string',
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_primary_key` tinyint NOT NULL DEFAULT '0',
  `base_column` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `type_classes` text COLLATE utf8mb4_unicode_ci,
  `sort_order` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `object_type_id` (`object_type_id`),
  CONSTRAINT `properties_ibfk_1` FOREIGN KEY (`object_type_id`) REFERENCES `object_types` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of properties
-- ----------------------------
BEGIN;
INSERT INTO `properties` (`id`, `object_type_id`, `name`, `type`, `description`, `is_primary_key`, `base_column`, `type_classes`, `sort_order`) VALUES ('p_ battery_cost_1775388584501', 'new_energy_vehicle', '电池成本（单位：万元）', 'double', NULL, 0, 'battery_cost', NULL, 0);
INSERT INTO `properties` (`id`, `object_type_id`, `name`, `type`, `description`, `is_primary_key`, `base_column`, `type_classes`, `sort_order`) VALUES ('p_batterycapacity_1775385756098', 'new_energy_vehicle', '电池容量（单位：kWh）', 'number', NULL, 0, 'battery_capacity', NULL, 0);
INSERT INTO `properties` (`id`, `object_type_id`, `name`, `type`, `description`, `is_primary_key`, `base_column`, `type_classes`, `sort_order`) VALUES ('p_brand_1775388584499', 'new_energy_vehicle', '品牌', 'string', NULL, 0, 'brand', NULL, 0);
INSERT INTO `properties` (`id`, `object_type_id`, `name`, `type`, `description`, `is_primary_key`, `base_column`, `type_classes`, `sort_order`) VALUES ('p_capacity_1775469262904', 'power_battery', '电池容量，单位通常为安时(Ah)或毫安时(mAh)', 'number', NULL, 0, 'capacity', NULL, 0);
INSERT INTO `properties` (`id`, `object_type_id`, `name`, `type`, `description`, `is_primary_key`, `base_column`, `type_classes`, `sort_order`) VALUES ('p_chemistry_1775469324420', 'power_battery', '电池化学类型，如锂离子、铅酸、镍氢等', 'string', NULL, 0, 'chemistry', NULL, 0);
INSERT INTO `properties` (`id`, `object_type_id`, `name`, `type`, `description`, `is_primary_key`, `base_column`, `type_classes`, `sort_order`) VALUES ('p_electrolytetype_1775650736187', 'battery_electrolyte', '电解液类型（如：液态、固态、凝胶、有机、无机等）\n', 'string', NULL, 0, 'electrolyte_type', NULL, 0);
INSERT INTO `properties` (`id`, `object_type_id`, `name`, `type`, `description`, `is_primary_key`, `base_column`, `type_classes`, `sort_order`) VALUES ('p_grade_1775652359942', 'lithium_carbonate', '品级，如电池级、工业级、医药级', 'string', NULL, 0, 'grade', NULL, 0);
INSERT INTO `properties` (`id`, `object_type_id`, `name`, `type`, `description`, `is_primary_key`, `base_column`, `type_classes`, `sort_order`) VALUES ('p_id_1775469202509', 'power_battery', '电池的唯一标识符', 'string', NULL, 1, 'unique_id', NULL, 0);
INSERT INTO `properties` (`id`, `object_type_id`, `name`, `type`, `description`, `is_primary_key`, `base_column`, `type_classes`, `sort_order`) VALUES ('p_id_1775650733670', 'battery_electrolyte', '电解液唯一标识符', 'string', NULL, 1, 'unique_id', NULL, 0);
INSERT INTO `properties` (`id`, `object_type_id`, `name`, `type`, `description`, `is_primary_key`, `base_column`, `type_classes`, `sort_order`) VALUES ('p_id_1775651827534', 'battery_cell', '电芯唯一标识符', 'string', NULL, 1, 'unique_id', NULL, 0);
INSERT INTO `properties` (`id`, `object_type_id`, `name`, `type`, `description`, `is_primary_key`, `base_column`, `type_classes`, `sort_order`) VALUES ('p_id_1775652265840', 'lithium_carbonate', '唯一标识符，如产品编码或批次号', 'string', NULL, 1, 'unique_id', NULL, 0);
INSERT INTO `properties` (`id`, `object_type_id`, `name`, `type`, `description`, `is_primary_key`, `base_column`, `type_classes`, `sort_order`) VALUES ('p_initial_cost_1775388584500', 'new_energy_vehicle', '初始成本（单位：万元）', 'double', NULL, 0, 'initial_cost', NULL, 0);
INSERT INTO `properties` (`id`, `object_type_id`, `name`, `type`, `description`, `is_primary_key`, `base_column`, `type_classes`, `sort_order`) VALUES ('p_initial_gross_margin_1775385756100', 'new_energy_vehicle', '初始毛利率', 'double', NULL, 0, 'initial_gross_margin', NULL, 0);
INSERT INTO `properties` (`id`, `object_type_id`, `name`, `type`, `description`, `is_primary_key`, `base_column`, `type_classes`, `sort_order`) VALUES ('p_isavailable_1775385758165', 'new_energy_vehicle', '是否在售', 'boolean', NULL, 0, 'is_available', NULL, 0);
INSERT INTO `properties` (`id`, `object_type_id`, `name`, `type`, `description`, `is_primary_key`, `base_column`, `type_classes`, `sort_order`) VALUES ('p_manufacturer_1775469343287', 'power_battery', '制造商名称', 'string', NULL, 0, 'manufacturer', NULL, 0);
INSERT INTO `properties` (`id`, `object_type_id`, `name`, `type`, `description`, `is_primary_key`, `base_column`, `type_classes`, `sort_order`) VALUES ('p_manufacturer_1775651931268', 'battery_cell', '生产厂家', 'string', NULL, 0, 'manufacturer', NULL, 0);
INSERT INTO `properties` (`id`, `object_type_id`, `name`, `type`, `description`, `is_primary_key`, `base_column`, `type_classes`, `sort_order`) VALUES ('p_manufacturer_1775652360925', 'lithium_carbonate', '生产厂家或供应商名称', 'string', NULL, 0, 'manufacturer', NULL, 0);
INSERT INTO `properties` (`id`, `object_type_id`, `name`, `type`, `description`, `is_primary_key`, `base_column`, `type_classes`, `sort_order`) VALUES ('p_material_id_1775651402080', 'cathode_material', '正极材料的唯一标识符', 'string', NULL, 1, 'material_id', NULL, 0);
INSERT INTO `properties` (`id`, `object_type_id`, `name`, `type`, `description`, `is_primary_key`, `base_column`, `type_classes`, `sort_order`) VALUES ('p_material_name_1775651404512', 'cathode_material', '正极材料的名称', 'string', NULL, 0, 'material_name', NULL, 0);
INSERT INTO `properties` (`id`, `object_type_id`, `name`, `type`, `description`, `is_primary_key`, `base_column`, `type_classes`, `sort_order`) VALUES ('p_model_1775469226104', 'power_battery', '电池型号', 'string', NULL, 0, 'model', NULL, 0);
INSERT INTO `properties` (`id`, `object_type_id`, `name`, `type`, `description`, `is_primary_key`, `base_column`, `type_classes`, `sort_order`) VALUES ('p_model_1775651928286', 'battery_cell', '电芯型号', 'string', NULL, 0, 'model', NULL, 0);
INSERT INTO `properties` (`id`, `object_type_id`, `name`, `type`, `description`, `is_primary_key`, `base_column`, `type_classes`, `sort_order`) VALUES ('p_modelname_1775385755582', 'new_energy_vehicle', '车型名称', 'string', NULL, 0, 'model_name', NULL, 0);
INSERT INTO `properties` (`id`, `object_type_id`, `name`, `type`, `description`, `is_primary_key`, `base_column`, `type_classes`, `sort_order`) VALUES ('p_name_1775650734536', 'battery_electrolyte', '电解液名称或型号', 'string', NULL, 0, 'name', NULL, 0);
INSERT INTO `properties` (`id`, `object_type_id`, `name`, `type`, `description`, `is_primary_key`, `base_column`, `type_classes`, `sort_order`) VALUES ('p_price_1775385757615', 'new_energy_vehicle', '指导价（单位：万元）', 'number', NULL, 0, 'price', NULL, 0);
INSERT INTO `properties` (`id`, `object_type_id`, `name`, `type`, `description`, `is_primary_key`, `base_column`, `type_classes`, `sort_order`) VALUES ('p_price_1775469202509', 'power_battery', '价格', 'double', NULL, 0, 'price', NULL, 0);
INSERT INTO `properties` (`id`, `object_type_id`, `name`, `type`, `description`, `is_primary_key`, `base_column`, `type_classes`, `sort_order`) VALUES ('p_price_1775650733671', 'battery_electrolyte', '价格（万元/吨）', 'double', NULL, 0, 'price', NULL, 0);
INSERT INTO `properties` (`id`, `object_type_id`, `name`, `type`, `description`, `is_primary_key`, `base_column`, `type_classes`, `sort_order`) VALUES ('p_price_1775651402081', 'cathode_material', '价格（万元/吨）', 'double', NULL, 0, 'price', NULL, 0);
INSERT INTO `properties` (`id`, `object_type_id`, `name`, `type`, `description`, `is_primary_key`, `base_column`, `type_classes`, `sort_order`) VALUES ('p_price_1775651827535', 'battery_cell', '价格（kwh）', 'double', NULL, 0, 'price', NULL, 0);
INSERT INTO `properties` (`id`, `object_type_id`, `name`, `type`, `description`, `is_primary_key`, `base_column`, `type_classes`, `sort_order`) VALUES ('p_price_1775652265840', 'lithium_carbonate', '价格（万元/吨）', 'double', NULL, 0, 'price', NULL, 0);
INSERT INTO `properties` (`id`, `object_type_id`, `name`, `type`, `description`, `is_primary_key`, `base_column`, `type_classes`, `sort_order`) VALUES ('p_price_date_1775385756099', 'new_energy_vehicle', '价格日期', 'date', NULL, 0, 'price_date', NULL, 0);
INSERT INTO `properties` (`id`, `object_type_id`, `name`, `type`, `description`, `is_primary_key`, `base_column`, `type_classes`, `sort_order`) VALUES ('p_price_date_1775469202510', 'power_battery', '价格日期', 'date', NULL, 0, 'price_date', NULL, 0);
INSERT INTO `properties` (`id`, `object_type_id`, `name`, `type`, `description`, `is_primary_key`, `base_column`, `type_classes`, `sort_order`) VALUES ('p_price_date_1775650733672', 'battery_electrolyte', '价格日期', 'date', NULL, 0, 'price_date', NULL, 0);
INSERT INTO `properties` (`id`, `object_type_id`, `name`, `type`, `description`, `is_primary_key`, `base_column`, `type_classes`, `sort_order`) VALUES ('p_price_date_1775651402082', 'cathode_material', '价格日期', 'date', NULL, 0, 'price_date', NULL, 0);
INSERT INTO `properties` (`id`, `object_type_id`, `name`, `type`, `description`, `is_primary_key`, `base_column`, `type_classes`, `sort_order`) VALUES ('p_price_date_1775651827536', 'battery_cell', '价格日期', 'date', NULL, 0, 'price_date', NULL, 0);
INSERT INTO `properties` (`id`, `object_type_id`, `name`, `type`, `description`, `is_primary_key`, `base_column`, `type_classes`, `sort_order`) VALUES ('p_price_date_1775652265842', 'lithium_carbonate', '价格日期', 'date', NULL, 0, 'price_date', NULL, 0);
INSERT INTO `properties` (`id`, `object_type_id`, `name`, `type`, `description`, `is_primary_key`, `base_column`, `type_classes`, `sort_order`) VALUES ('p_productiondate_1775385756864', 'new_energy_vehicle', '生产日期', 'date', NULL, 0, 'production_date', NULL, 0);
INSERT INTO `properties` (`id`, `object_type_id`, `name`, `type`, `description`, `is_primary_key`, `base_column`, `type_classes`, `sort_order`) VALUES ('p_productiondate_1775469378170', 'power_battery', '生产日期', 'date', NULL, 0, 'production_date', NULL, 0);
INSERT INTO `properties` (`id`, `object_type_id`, `name`, `type`, `description`, `is_primary_key`, `base_column`, `type_classes`, `sort_order`) VALUES ('p_range_1775385756349', 'new_energy_vehicle', '续航里程（单位：公里）', 'number', NULL, 0, 'range_km', NULL, 0);
INSERT INTO `properties` (`id`, `object_type_id`, `name`, `type`, `description`, `is_primary_key`, `base_column`, `type_classes`, `sort_order`) VALUES ('p_vehicleid_1775385754771', 'new_energy_vehicle', '车辆唯一标识符（VIN码）', 'string', NULL, 1, 'vehicle_id', NULL, 0);
INSERT INTO `properties` (`id`, `object_type_id`, `name`, `type`, `description`, `is_primary_key`, `base_column`, `type_classes`, `sort_order`) VALUES ('p_vehicletype_1775385756547', 'new_energy_vehicle', '车辆类型（如：纯电动BEV、插电混动PHEV、增程式EREV）', 'string', NULL, 0, 'vehicle_type', NULL, 0);
INSERT INTO `properties` (`id`, `object_type_id`, `name`, `type`, `description`, `is_primary_key`, `base_column`, `type_classes`, `sort_order`) VALUES ('p_voltage_1775469302687', 'power_battery', '额定电压，单位伏特(V)', 'number', NULL, 0, 'voltage', NULL, 0);
COMMIT;

-- ----------------------------
-- Table structure for three_electric_system
-- ----------------------------
DROP TABLE IF EXISTS `three_electric_system`;
CREATE TABLE `three_electric_system` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '自增主键ID',
  `system_name` varchar(100) DEFAULT NULL COMMENT '三电系统名称/型号',
  `motor_power` decimal(10,2) DEFAULT NULL COMMENT '电机功率（单位：kW）',
  `voltage_platform` varchar(50) DEFAULT NULL COMMENT '电压平台（如：400V、800V）',
  `charge_power` decimal(10,2) DEFAULT NULL COMMENT '充电功率（单位：kW）',
  `is_intelligent` tinyint(1) DEFAULT '0' COMMENT '是否具备智能能量管理功能',
  `production_date` date DEFAULT NULL COMMENT '生产日期',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_system_name` (`system_name`),
  KEY `idx_voltage_platform` (`voltage_platform`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='三电系统信息表';

-- ----------------------------
-- Records of three_electric_system
-- ----------------------------
BEGIN;
INSERT INTO `three_electric_system` (`id`, `system_name`, `motor_power`, `voltage_platform`, `charge_power`, `is_intelligent`, `production_date`, `created_at`, `updated_at`) VALUES (1, '特斯拉 第四代电驱系统', 220.00, '400V', 170.00, 1, '2024-01-15', '2026-04-05 19:51:16', '2026-04-05 19:51:16');
INSERT INTO `three_electric_system` (`id`, `system_name`, `motor_power`, `voltage_platform`, `charge_power`, `is_intelligent`, `production_date`, `created_at`, `updated_at`) VALUES (2, '特斯拉 800V高压平台', 350.00, '800V', 350.00, 1, '2024-02-20', '2026-04-05 19:51:16', '2026-04-05 19:51:16');
INSERT INTO `three_electric_system` (`id`, `system_name`, `motor_power`, `voltage_platform`, `charge_power`, `is_intelligent`, `production_date`, `created_at`, `updated_at`) VALUES (3, '比亚迪 八合一电动力总成', 150.00, '400V', 120.00, 1, '2024-03-10', '2026-04-05 19:51:16', '2026-04-05 19:51:16');
INSERT INTO `three_electric_system` (`id`, `system_name`, `motor_power`, `voltage_platform`, `charge_power`, `is_intelligent`, `production_date`, `created_at`, `updated_at`) VALUES (4, '比亚迪 e平台3.0 Evo', 230.00, '800V', 300.00, 1, '2024-01-08', '2026-04-05 19:51:16', '2026-04-05 19:51:16');
INSERT INTO `three_electric_system` (`id`, `system_name`, `motor_power`, `voltage_platform`, `charge_power`, `is_intelligent`, `production_date`, `created_at`, `updated_at`) VALUES (5, '蔚来 第二代电驱系统', 210.00, '400V', 180.00, 1, '2024-02-15', '2026-04-05 19:51:16', '2026-04-05 19:51:16');
INSERT INTO `three_electric_system` (`id`, `system_name`, `motor_power`, `voltage_platform`, `charge_power`, `is_intelligent`, `production_date`, `created_at`, `updated_at`) VALUES (6, '蔚来 900V高压架构', 480.00, '900V', 600.00, 1, '2024-03-22', '2026-04-05 19:51:16', '2026-04-05 19:51:16');
INSERT INTO `three_electric_system` (`id`, `system_name`, `motor_power`, `voltage_platform`, `charge_power`, `is_intelligent`, `production_date`, `created_at`, `updated_at`) VALUES (7, '小鹏 800V XPower', 218.00, '800V', 330.00, 1, '2024-01-20', '2026-04-05 19:51:16', '2026-04-05 19:51:16');
INSERT INTO `three_electric_system` (`id`, `system_name`, `motor_power`, `voltage_platform`, `charge_power`, `is_intelligent`, `production_date`, `created_at`, `updated_at`) VALUES (8, '小鹏 后置油冷电机', 316.00, '800V', 400.00, 1, '2024-02-28', '2026-04-05 19:51:16', '2026-04-05 19:51:16');
INSERT INTO `three_electric_system` (`id`, `system_name`, `motor_power`, `voltage_platform`, `charge_power`, `is_intelligent`, `production_date`, `created_at`, `updated_at`) VALUES (9, '理想 增程电动系统', 330.00, '400V', 90.00, 1, '2024-03-05', '2026-04-05 19:51:16', '2026-04-05 19:51:16');
INSERT INTO `three_electric_system` (`id`, `system_name`, `motor_power`, `voltage_platform`, `charge_power`, `is_intelligent`, `production_date`, `created_at`, `updated_at`) VALUES (10, '理想 纯电高压平台', 400.00, '800V', 520.00, 1, '2024-01-12', '2026-04-05 19:51:16', '2026-04-05 19:51:16');
INSERT INTO `three_electric_system` (`id`, `system_name`, `motor_power`, `voltage_platform`, `charge_power`, `is_intelligent`, `production_date`, `created_at`, `updated_at`) VALUES (11, '广汽埃安 夸克电驱', 165.00, '400V', 100.00, 0, '2024-02-18', '2026-04-05 19:51:16', '2026-04-05 19:51:16');
INSERT INTO `three_electric_system` (`id`, `system_name`, `motor_power`, `voltage_platform`, `charge_power`, `is_intelligent`, `production_date`, `created_at`, `updated_at`) VALUES (12, '广汽埃安 弹匣电池2.0', 250.00, '800V', 480.00, 1, '2024-03-15', '2026-04-05 19:51:16', '2026-04-05 19:51:16');
INSERT INTO `three_electric_system` (`id`, `system_name`, `motor_power`, `voltage_platform`, `charge_power`, `is_intelligent`, `production_date`, `created_at`, `updated_at`) VALUES (13, '极氪 威睿电驱系统', 200.00, '400V', 150.00, 1, '2024-01-25', '2026-04-05 19:51:16', '2026-04-05 19:51:16');
INSERT INTO `three_electric_system` (`id`, `system_name`, `motor_power`, `voltage_platform`, `charge_power`, `is_intelligent`, `production_date`, `created_at`, `updated_at`) VALUES (14, '极氪 金砖电池系统', 310.00, '800V', 500.00, 1, '2024-02-10', '2026-04-05 19:51:16', '2026-04-05 19:51:16');
INSERT INTO `three_electric_system` (`id`, `system_name`, `motor_power`, `voltage_platform`, `charge_power`, `is_intelligent`, `production_date`, `created_at`, `updated_at`) VALUES (15, '华为 DriveONE 三合一', 200.00, '400V', 140.00, 1, '2024-03-08', '2026-04-05 19:51:16', '2026-04-05 19:51:16');
INSERT INTO `three_electric_system` (`id`, `system_name`, `motor_power`, `voltage_platform`, `charge_power`, `is_intelligent`, `production_date`, `created_at`, `updated_at`) VALUES (16, '华为 巨鲸高压平台', 365.00, '800V', 600.00, 1, '2024-01-30', '2026-04-05 19:51:16', '2026-04-05 19:51:16');
INSERT INTO `three_electric_system` (`id`, `system_name`, `motor_power`, `voltage_platform`, `charge_power`, `is_intelligent`, `production_date`, `created_at`, `updated_at`) VALUES (17, '长安 原力超集电驱', 190.00, '400V', 110.00, 0, '2024-02-25', '2026-04-05 19:51:16', '2026-04-05 19:51:16');
INSERT INTO `three_electric_system` (`id`, `system_name`, `motor_power`, `voltage_platform`, `charge_power`, `is_intelligent`, `production_date`, `created_at`, `updated_at`) VALUES (18, '长安 金钟罩电池', 258.00, '800V', 450.00, 1, '2024-03-20', '2026-04-05 19:51:16', '2026-04-05 19:51:16');
INSERT INTO `three_electric_system` (`id`, `system_name`, `motor_power`, `voltage_platform`, `charge_power`, `is_intelligent`, `production_date`, `created_at`, `updated_at`) VALUES (19, '吉利 雷神电混8848', 160.00, '400V', 85.00, 1, '2024-01-18', '2026-04-05 19:51:16', '2026-04-05 19:51:16');
INSERT INTO `three_electric_system` (`id`, `system_name`, `motor_power`, `voltage_platform`, `charge_power`, `is_intelligent`, `production_date`, `created_at`, `updated_at`) VALUES (20, '吉利 神盾短刀电池', 200.00, '800V', 350.00, 1, '2024-02-22', '2026-04-05 19:51:16', '2026-04-05 19:51:16');
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
