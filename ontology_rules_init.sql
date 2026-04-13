-- 本体规则数据：对象类型的CRUD接口定义
-- 为6个对象类型生成GET、POST、PUT、DELETE四种操作规则

-- 清空现有规则数据（可选）
-- TRUNCATE TABLE ontology_rule_params;
-- TRUNCATE TABLE ontology_rules;

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. 新能源整车 (new_energy_vehicle)
-- ══════════════════════════════════════════════════════════════════════════════

-- GET 列表查询
INSERT INTO ontology_rules (id, rule_category, function_name, interface_type, request_method, interface_url, created_at, updated_at)
VALUES ('rule_nev_list', 'CREATE_OBJECT', 'listNewEnergyVehicles', 'RESTFUL', 'GET', '/api/instances/new_energy_vehicle', NOW(), NOW());

INSERT INTO ontology_rule_params (id, rule_id, param_direction, param_name, param_type, is_required, description, sort_order) VALUES
('rule_nev_list_in_0', 'rule_nev_list', 'INPUT', 'limit', 'integer', 0, '返回记录数量限制，默认100', 0),
('rule_nev_list_in_1', 'rule_nev_list', 'INPUT', 'offset', 'integer', 0, '偏移量，用于分页', 1),
('rule_nev_list_out_0', 'rule_nev_list', 'OUTPUT', 'data', 'array', 1, '实例数据数组', 0),
('rule_nev_list_out_1', 'rule_nev_list', 'OUTPUT', 'total', 'integer', 1, '总记录数', 1),
('rule_nev_list_out_2', 'rule_nev_list', 'OUTPUT', 'objectType', 'object', 0, '对象类型元数据', 2);

-- GET 单个查询
INSERT INTO ontology_rules (id, rule_category, function_name, interface_type, request_method, interface_url, created_at, updated_at)
VALUES ('rule_nev_get', 'CREATE_OBJECT', 'getNewEnergyVehicle', 'RESTFUL', 'GET', '/api/instances/new_energy_vehicle/{id}', NOW(), NOW());

INSERT INTO ontology_rule_params (id, rule_id, param_direction, param_name, param_type, is_required, description, sort_order) VALUES
('rule_nev_get_in_0', 'rule_nev_get', 'INPUT', 'id', 'string', 1, '实例ID（主键）', 0),
('rule_nev_get_out_0', 'rule_nev_get', 'OUTPUT', 'data', 'object', 1, '实例数据对象', 0);

-- POST 创建
INSERT INTO ontology_rules (id, rule_category, function_name, interface_type, request_method, interface_url, created_at, updated_at)
VALUES ('rule_nev_create', 'CREATE_OBJECT', 'createNewEnergyVehicle', 'RESTFUL', 'POST', '/api/instances/new_energy_vehicle', NOW(), NOW());

INSERT INTO ontology_rule_params (id, rule_id, param_direction, param_name, param_type, is_required, description, sort_order) VALUES
('rule_nev_create_in_0', 'rule_nev_create', 'INPUT', 'model_name', 'string', 1, '车型名称', 0),
('rule_nev_create_in_1', 'rule_nev_create', 'INPUT', 'brand', 'string', 1, '品牌', 1),
('rule_nev_create_in_2', 'rule_nev_create', 'INPUT', 'price', 'number', 0, '指导价（单位：万元）', 2),
('rule_nev_create_in_3', 'rule_nev_create', 'INPUT', 'battery_capacity', 'number', 0, '电池容量（单位：kWh）', 3),
('rule_nev_create_in_4', 'rule_nev_create', 'INPUT', 'is_available', 'boolean', 0, '是否在售', 4),
('rule_nev_create_out_0', 'rule_nev_create', 'OUTPUT', 'success', 'boolean', 1, '操作是否成功', 0),
('rule_nev_create_out_1', 'rule_nev_create', 'OUTPUT', 'message', 'string', 0, '返回消息', 1);

-- PUT 更新
INSERT INTO ontology_rules (id, rule_category, function_name, interface_type, request_method, interface_url, created_at, updated_at)
VALUES ('rule_nev_update', 'UPDATE_OBJECT', 'updateNewEnergyVehicle', 'RESTFUL', 'PUT', '/api/instances/new_energy_vehicle/{id}', NOW(), NOW());

INSERT INTO ontology_rule_params (id, rule_id, param_direction, param_name, param_type, is_required, description, sort_order) VALUES
('rule_nev_update_in_0', 'rule_nev_update', 'INPUT', 'id', 'string', 1, '实例ID（主键）', 0),
('rule_nev_update_in_1', 'rule_nev_update', 'INPUT', 'model_name', 'string', 0, '车型名称', 1),
('rule_nev_update_in_2', 'rule_nev_update', 'INPUT', 'brand', 'string', 0, '品牌', 2),
('rule_nev_update_in_3', 'rule_nev_update', 'INPUT', 'price', 'number', 0, '指导价（单位：万元）', 3),
('rule_nev_update_in_4', 'rule_nev_update', 'INPUT', 'battery_capacity', 'number', 0, '电池容量（单位：kWh）', 4),
('rule_nev_update_out_0', 'rule_nev_update', 'OUTPUT', 'success', 'boolean', 1, '操作是否成功', 0),
('rule_nev_update_out_1', 'rule_nev_update', 'OUTPUT', 'message', 'string', 0, '返回消息', 1);

-- DELETE 删除
INSERT INTO ontology_rules (id, rule_category, function_name, interface_type, request_method, interface_url, created_at, updated_at)
VALUES ('rule_nev_delete', 'DELETE_OBJECT', 'deleteNewEnergyVehicle', 'RESTFUL', 'DELETE', '/api/instances/new_energy_vehicle/{id}', NOW(), NOW());

INSERT INTO ontology_rule_params (id, rule_id, param_direction, param_name, param_type, is_required, description, sort_order) VALUES
('rule_nev_delete_in_0', 'rule_nev_delete', 'INPUT', 'id', 'string', 1, '实例ID（主键）', 0),
('rule_nev_delete_out_0', 'rule_nev_delete', 'OUTPUT', 'success', 'boolean', 1, '操作是否成功', 0),
('rule_nev_delete_out_1', 'rule_nev_delete', 'OUTPUT', 'message', 'string', 0, '返回消息', 1);


-- ══════════════════════════════════════════════════════════════════════════════
-- 2. 电池 (power_battery)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO ontology_rules (id, rule_category, function_name, interface_type, request_method, interface_url, created_at, updated_at)
VALUES ('rule_pb_list', 'CREATE_OBJECT', 'listPowerBatteries', 'RESTFUL', 'GET', '/api/instances/power_battery', NOW(), NOW());

INSERT INTO ontology_rule_params (id, rule_id, param_direction, param_name, param_type, is_required, description, sort_order) VALUES
('rule_pb_list_in_0', 'rule_pb_list', 'INPUT', 'limit', 'integer', 0, '返回记录数量限制', 0),
('rule_pb_list_in_1', 'rule_pb_list', 'INPUT', 'offset', 'integer', 0, '偏移量', 1),
('rule_pb_list_out_0', 'rule_pb_list', 'OUTPUT', 'data', 'array', 1, '实例数据数组', 0),
('rule_pb_list_out_1', 'rule_pb_list', 'OUTPUT', 'total', 'integer', 1, '总记录数', 1);

INSERT INTO ontology_rules (id, rule_category, function_name, interface_type, request_method, interface_url, created_at, updated_at)
VALUES ('rule_pb_get', 'CREATE_OBJECT', 'getPowerBattery', 'RESTFUL', 'GET', '/api/instances/power_battery/{id}', NOW(), NOW());

INSERT INTO ontology_rule_params (id, rule_id, param_direction, param_name, param_type, is_required, description, sort_order) VALUES
('rule_pb_get_in_0', 'rule_pb_get', 'INPUT', 'id', 'string', 1, '实例ID（unique_id）', 0),
('rule_pb_get_out_0', 'rule_pb_get', 'OUTPUT', 'data', 'object', 1, '实例数据对象', 0);

INSERT INTO ontology_rules (id, rule_category, function_name, interface_type, request_method, interface_url, created_at, updated_at)
VALUES ('rule_pb_create', 'CREATE_OBJECT', 'createPowerBattery', 'RESTFUL', 'POST', '/api/instances/power_battery', NOW(), NOW());

INSERT INTO ontology_rule_params (id, rule_id, param_direction, param_name, param_type, is_required, description, sort_order) VALUES
('rule_pb_create_in_0', 'rule_pb_create', 'INPUT', 'unique_id', 'string', 1, '电池唯一标识符', 0),
('rule_pb_create_in_1', 'rule_pb_create', 'INPUT', 'model', 'string', 0, '电池型号', 1),
('rule_pb_create_in_2', 'rule_pb_create', 'INPUT', 'manufacturer', 'string', 0, '制造商名称', 2),
('rule_pb_create_in_3', 'rule_pb_create', 'INPUT', 'capacity', 'number', 0, '电池容量（Ah或mAh）', 3),
('rule_pb_create_in_4', 'rule_pb_create', 'INPUT', 'price', 'double', 0, '价格', 4),
('rule_pb_create_out_0', 'rule_pb_create', 'OUTPUT', 'success', 'boolean', 1, '操作是否成功', 0);

INSERT INTO ontology_rules (id, rule_category, function_name, interface_type, request_method, interface_url, created_at, updated_at)
VALUES ('rule_pb_update', 'UPDATE_OBJECT', 'updatePowerBattery', 'RESTFUL', 'PUT', '/api/instances/power_battery/{id}', NOW(), NOW());

INSERT INTO ontology_rule_params (id, rule_id, param_direction, param_name, param_type, is_required, description, sort_order) VALUES
('rule_pb_update_in_0', 'rule_pb_update', 'INPUT', 'id', 'string', 1, '实例ID', 0),
('rule_pb_update_in_1', 'rule_pb_update', 'INPUT', 'model', 'string', 0, '电池型号', 1),
('rule_pb_update_in_2', 'rule_pb_update', 'INPUT', 'price', 'double', 0, '价格', 2),
('rule_pb_update_out_0', 'rule_pb_update', 'OUTPUT', 'success', 'boolean', 1, '操作是否成功', 0);

INSERT INTO ontology_rules (id, rule_category, function_name, interface_type, request_method, interface_url, created_at, updated_at)
VALUES ('rule_pb_delete', 'DELETE_OBJECT', 'deletePowerBattery', 'RESTFUL', 'DELETE', '/api/instances/power_battery/{id}', NOW(), NOW());

INSERT INTO ontology_rule_params (id, rule_id, param_direction, param_name, param_type, is_required, description, sort_order) VALUES
('rule_pb_delete_in_0', 'rule_pb_delete', 'INPUT', 'id', 'string', 1, '实例ID', 0),
('rule_pb_delete_out_0', 'rule_pb_delete', 'OUTPUT', 'success', 'boolean', 1, '操作是否成功', 0);


-- ══════════════════════════════════════════════════════════════════════════════
-- 3. 电芯 (battery_cell)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO ontology_rules (id, rule_category, function_name, interface_type, request_method, interface_url, created_at, updated_at)
VALUES ('rule_bc_list', 'CREATE_OBJECT', 'listBatteryCells', 'RESTFUL', 'GET', '/api/instances/battery_cell', NOW(), NOW());

INSERT INTO ontology_rule_params (id, rule_id, param_direction, param_name, param_type, is_required, description, sort_order) VALUES
('rule_bc_list_in_0', 'rule_bc_list', 'INPUT', 'limit', 'integer', 0, '返回记录数量限制', 0),
('rule_bc_list_out_0', 'rule_bc_list', 'OUTPUT', 'data', 'array', 1, '实例数据数组', 0),
('rule_bc_list_out_1', 'rule_bc_list', 'OUTPUT', 'total', 'integer', 1, '总记录数', 1);

INSERT INTO ontology_rules (id, rule_category, function_name, interface_type, request_method, interface_url, created_at, updated_at)
VALUES ('rule_bc_get', 'CREATE_OBJECT', 'getBatteryCell', 'RESTFUL', 'GET', '/api/instances/battery_cell/{id}', NOW(), NOW());

INSERT INTO ontology_rule_params (id, rule_id, param_direction, param_name, param_type, is_required, description, sort_order) VALUES
('rule_bc_get_in_0', 'rule_bc_get', 'INPUT', 'id', 'string', 1, '实例ID', 0),
('rule_bc_get_out_0', 'rule_bc_get', 'OUTPUT', 'data', 'object', 1, '实例数据', 0);

INSERT INTO ontology_rules (id, rule_category, function_name, interface_type, request_method, interface_url, created_at, updated_at)
VALUES ('rule_bc_create', 'CREATE_OBJECT', 'createBatteryCell', 'RESTFUL', 'POST', '/api/instances/battery_cell', NOW(), NOW());

INSERT INTO ontology_rule_params (id, rule_id, param_direction, param_name, param_type, is_required, description, sort_order) VALUES
('rule_bc_create_in_0', 'rule_bc_create', 'INPUT', 'unique_id', 'string', 1, '电芯唯一标识符', 0),
('rule_bc_create_in_1', 'rule_bc_create', 'INPUT', 'model', 'string', 0, '电芯型号', 1),
('rule_bc_create_in_2', 'rule_bc_create', 'INPUT', 'manufacturer', 'string', 0, '生产厂家', 2),
('rule_bc_create_out_0', 'rule_bc_create', 'OUTPUT', 'success', 'boolean', 1, '操作是否成功', 0);

INSERT INTO ontology_rules (id, rule_category, function_name, interface_type, request_method, interface_url, created_at, updated_at)
VALUES ('rule_bc_update', 'UPDATE_OBJECT', 'updateBatteryCell', 'RESTFUL', 'PUT', '/api/instances/battery_cell/{id}', NOW(), NOW());

INSERT INTO ontology_rule_params (id, rule_id, param_direction, param_name, param_type, is_required, description, sort_order) VALUES
('rule_bc_update_in_0', 'rule_bc_update', 'INPUT', 'id', 'string', 1, '实例ID', 0),
('rule_bc_update_in_1', 'rule_bc_update', 'INPUT', 'model', 'string', 0, '电芯型号', 1),
('rule_bc_update_out_0', 'rule_bc_update', 'OUTPUT', 'success', 'boolean', 1, '操作是否成功', 0);

INSERT INTO ontology_rules (id, rule_category, function_name, interface_type, request_method, interface_url, created_at, updated_at)
VALUES ('rule_bc_delete', 'DELETE_OBJECT', 'deleteBatteryCell', 'RESTFUL', 'DELETE', '/api/instances/battery_cell/{id}', NOW(), NOW());

INSERT INTO ontology_rule_params (id, rule_id, param_direction, param_name, param_type, is_required, description, sort_order) VALUES
('rule_bc_delete_in_0', 'rule_bc_delete', 'INPUT', 'id', 'string', 1, '实例ID', 0),
('rule_bc_delete_out_0', 'rule_bc_delete', 'OUTPUT', 'success', 'boolean', 1, '操作是否成功', 0);


-- ══════════════════════════════════════════════════════════════════════════════
-- 4. 正极材料 (cathode_material)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO ontology_rules (id, rule_category, function_name, interface_type, request_method, interface_url, created_at, updated_at)
VALUES ('rule_cm_list', 'CREATE_OBJECT', 'listCathodeMaterials', 'RESTFUL', 'GET', '/api/instances/cathode_material', NOW(), NOW());

INSERT INTO ontology_rule_params (id, rule_id, param_direction, param_name, param_type, is_required, description, sort_order) VALUES
('rule_cm_list_in_0', 'rule_cm_list', 'INPUT', 'limit', 'integer', 0, '返回记录数量限制', 0),
('rule_cm_list_out_0', 'rule_cm_list', 'OUTPUT', 'data', 'array', 1, '实例数据数组', 0),
('rule_cm_list_out_1', 'rule_cm_list', 'OUTPUT', 'total', 'integer', 1, '总记录数', 1);

INSERT INTO ontology_rules (id, rule_category, function_name, interface_type, request_method, interface_url, created_at, updated_at)
VALUES ('rule_cm_get', 'CREATE_OBJECT', 'getCathodeMaterial', 'RESTFUL', 'GET', '/api/instances/cathode_material/{id}', NOW(), NOW());

INSERT INTO ontology_rule_params (id, rule_id, param_direction, param_name, param_type, is_required, description, sort_order) VALUES
('rule_cm_get_in_0', 'rule_cm_get', 'INPUT', 'id', 'string', 1, '实例ID', 0),
('rule_cm_get_out_0', 'rule_cm_get', 'OUTPUT', 'data', 'object', 1, '实例数据', 0);

INSERT INTO ontology_rules (id, rule_category, function_name, interface_type, request_method, interface_url, created_at, updated_at)
VALUES ('rule_cm_create', 'CREATE_OBJECT', 'createCathodeMaterial', 'RESTFUL', 'POST', '/api/instances/cathode_material', NOW(), NOW());

INSERT INTO ontology_rule_params (id, rule_id, param_direction, param_name, param_type, is_required, description, sort_order) VALUES
('rule_cm_create_in_0', 'rule_cm_create', 'INPUT', 'material_id', 'string', 1, '正极材料唯一标识符', 0),
('rule_cm_create_in_1', 'rule_cm_create', 'INPUT', 'material_name', 'string', 0, '正极材料名称', 1),
('rule_cm_create_out_0', 'rule_cm_create', 'OUTPUT', 'success', 'boolean', 1, '操作是否成功', 0);

INSERT INTO ontology_rules (id, rule_category, function_name, interface_type, request_method, interface_url, created_at, updated_at)
VALUES ('rule_cm_update', 'UPDATE_OBJECT', 'updateCathodeMaterial', 'RESTFUL', 'PUT', '/api/instances/cathode_material/{id}', NOW(), NOW());

INSERT INTO ontology_rule_params (id, rule_id, param_direction, param_name, param_type, is_required, description, sort_order) VALUES
('rule_cm_update_in_0', 'rule_cm_update', 'INPUT', 'id', 'string', 1, '实例ID', 0),
('rule_cm_update_in_1', 'rule_cm_update', 'INPUT', 'material_name', 'string', 0, '正极材料名称', 1),
('rule_cm_update_out_0', 'rule_cm_update', 'OUTPUT', 'success', 'boolean', 1, '操作是否成功', 0);

INSERT INTO ontology_rules (id, rule_category, function_name, interface_type, request_method, interface_url, created_at, updated_at)
VALUES ('rule_cm_delete', 'DELETE_OBJECT', 'deleteCathodeMaterial', 'RESTFUL', 'DELETE', '/api/instances/cathode_material/{id}', NOW(), NOW());

INSERT INTO ontology_rule_params (id, rule_id, param_direction, param_name, param_type, is_required, description, sort_order) VALUES
('rule_cm_delete_in_0', 'rule_cm_delete', 'INPUT', 'id', 'string', 1, '实例ID', 0),
('rule_cm_delete_out_0', 'rule_cm_delete', 'OUTPUT', 'success', 'boolean', 1, '操作是否成功', 0);


-- ══════════════════════════════════════════════════════════════════════════════
-- 5. 碳酸锂 (lithium_carbonate)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO ontology_rules (id, rule_category, function_name, interface_type, request_method, interface_url, created_at, updated_at)
VALUES ('rule_lc_list', 'CREATE_OBJECT', 'listLithiumCarbonates', 'RESTFUL', 'GET', '/api/instances/lithium_carbonate', NOW(), NOW());

INSERT INTO ontology_rule_params (id, rule_id, param_direction, param_name, param_type, is_required, description, sort_order) VALUES
('rule_lc_list_in_0', 'rule_lc_list', 'INPUT', 'limit', 'integer', 0, '返回记录数量限制', 0),
('rule_lc_list_out_0', 'rule_lc_list', 'OUTPUT', 'data', 'array', 1, '实例数据数组', 0),
('rule_lc_list_out_1', 'rule_lc_list', 'OUTPUT', 'total', 'integer', 1, '总记录数', 1);

INSERT INTO ontology_rules (id, rule_category, function_name, interface_type, request_method, interface_url, created_at, updated_at)
VALUES ('rule_lc_get', 'CREATE_OBJECT', 'getLithiumCarbonate', 'RESTFUL', 'GET', '/api/instances/lithium_carbonate/{id}', NOW(), NOW());

INSERT INTO ontology_rule_params (id, rule_id, param_direction, param_name, param_type, is_required, description, sort_order) VALUES
('rule_lc_get_in_0', 'rule_lc_get', 'INPUT', 'id', 'string', 1, '实例ID', 0),
('rule_lc_get_out_0', 'rule_lc_get', 'OUTPUT', 'data', 'object', 1, '实例数据', 0);

INSERT INTO ontology_rules (id, rule_category, function_name, interface_type, request_method, interface_url, created_at, updated_at)
VALUES ('rule_lc_create', 'CREATE_OBJECT', 'createLithiumCarbonate', 'RESTFUL', 'POST', '/api/instances/lithium_carbonate', NOW(), NOW());

INSERT INTO ontology_rule_params (id, rule_id, param_direction, param_name, param_type, is_required, description, sort_order) VALUES
('rule_lc_create_in_0', 'rule_lc_create', 'INPUT', 'unique_id', 'string', 1, '唯一标识符', 0),
('rule_lc_create_in_1', 'rule_lc_create', 'INPUT', 'grade', 'string', 0, '品级（电池级、工业级、医药级）', 1),
('rule_lc_create_in_2', 'rule_lc_create', 'INPUT', 'manufacturer', 'string', 0, '生产厂家或供应商名称', 2),
('rule_lc_create_out_0', 'rule_lc_create', 'OUTPUT', 'success', 'boolean', 1, '操作是否成功', 0);

INSERT INTO ontology_rules (id, rule_category, function_name, interface_type, request_method, interface_url, created_at, updated_at)
VALUES ('rule_lc_update', 'UPDATE_OBJECT', 'updateLithiumCarbonate', 'RESTFUL', 'PUT', '/api/instances/lithium_carbonate/{id}', NOW(), NOW());

INSERT INTO ontology_rule_params (id, rule_id, param_direction, param_name, param_type, is_required, description, sort_order) VALUES
('rule_lc_update_in_0', 'rule_lc_update', 'INPUT', 'id', 'string', 1, '实例ID', 0),
('rule_lc_update_in_1', 'rule_lc_update', 'INPUT', 'grade', 'string', 0, '品级', 1),
('rule_lc_update_out_0', 'rule_lc_update', 'OUTPUT', 'success', 'boolean', 1, '操作是否成功', 0);

INSERT INTO ontology_rules (id, rule_category, function_name, interface_type, request_method, interface_url, created_at, updated_at)
VALUES ('rule_lc_delete', 'DELETE_OBJECT', 'deleteLithiumCarbonate', 'RESTFUL', 'DELETE', '/api/instances/lithium_carbonate/{id}', NOW(), NOW());

INSERT INTO ontology_rule_params (id, rule_id, param_direction, param_name, param_type, is_required, description, sort_order) VALUES
('rule_lc_delete_in_0', 'rule_lc_delete', 'INPUT', 'id', 'string', 1, '实例ID', 0),
('rule_lc_delete_out_0', 'rule_lc_delete', 'OUTPUT', 'success', 'boolean', 1, '操作是否成功', 0);


-- ══════════════════════════════════════════════════════════════════════════════
-- 6. 电池电解液 (battery_electrolyte)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO ontology_rules (id, rule_category, function_name, interface_type, request_method, interface_url, created_at, updated_at)
VALUES ('rule_be_list', 'CREATE_OBJECT', 'listBatteryElectrolytes', 'RESTFUL', 'GET', '/api/instances/battery_electrolyte', NOW(), NOW());

INSERT INTO ontology_rule_params (id, rule_id, param_direction, param_name, param_type, is_required, description, sort_order) VALUES
('rule_be_list_in_0', 'rule_be_list', 'INPUT', 'limit', 'integer', 0, '返回记录数量限制', 0),
('rule_be_list_out_0', 'rule_be_list', 'OUTPUT', 'data', 'array', 1, '实例数据数组', 0),
('rule_be_list_out_1', 'rule_be_list', 'OUTPUT', 'total', 'integer', 1, '总记录数', 1);

INSERT INTO ontology_rules (id, rule_category, function_name, interface_type, request_method, interface_url, created_at, updated_at)
VALUES ('rule_be_get', 'CREATE_OBJECT', 'getBatteryElectrolyte', 'RESTFUL', 'GET', '/api/instances/battery_electrolyte/{id}', NOW(), NOW());

INSERT INTO ontology_rule_params (id, rule_id, param_direction, param_name, param_type, is_required, description, sort_order) VALUES
('rule_be_get_in_0', 'rule_be_get', 'INPUT', 'id', 'string', 1, '实例ID', 0),
('rule_be_get_out_0', 'rule_be_get', 'OUTPUT', 'data', 'object', 1, '实例数据', 0);

INSERT INTO ontology_rules (id, rule_category, function_name, interface_type, request_method, interface_url, created_at, updated_at)
VALUES ('rule_be_create', 'CREATE_OBJECT', 'createBatteryElectrolyte', 'RESTFUL', 'POST', '/api/instances/battery_electrolyte', NOW(), NOW());

INSERT INTO ontology_rule_params (id, rule_id, param_direction, param_name, param_type, is_required, description, sort_order) VALUES
('rule_be_create_in_0', 'rule_be_create', 'INPUT', 'unique_id', 'string', 1, '电解液唯一标识符', 0),
('rule_be_create_in_1', 'rule_be_create', 'INPUT', 'name', 'string', 0, '电解液名称或型号', 1),
('rule_be_create_in_2', 'rule_be_create', 'INPUT', 'electrolyte_type', 'string', 0, '电解液类型（液态、固态、凝胶等）', 2),
('rule_be_create_out_0', 'rule_be_create', 'OUTPUT', 'success', 'boolean', 1, '操作是否成功', 0);

INSERT INTO ontology_rules (id, rule_category, function_name, interface_type, request_method, interface_url, created_at, updated_at)
VALUES ('rule_be_update', 'UPDATE_OBJECT', 'updateBatteryElectrolyte', 'RESTFUL', 'PUT', '/api/instances/battery_electrolyte/{id}', NOW(), NOW());

INSERT INTO ontology_rule_params (id, rule_id, param_direction, param_name, param_type, is_required, description, sort_order) VALUES
('rule_be_update_in_0', 'rule_be_update', 'INPUT', 'id', 'string', 1, '实例ID', 0),
('rule_be_update_in_1', 'rule_be_update', 'INPUT', 'name', 'string', 0, '电解液名称', 1),
('rule_be_update_out_0', 'rule_be_update', 'OUTPUT', 'success', 'boolean', 1, '操作是否成功', 0);

INSERT INTO ontology_rules (id, rule_category, function_name, interface_type, request_method, interface_url, created_at, updated_at)
VALUES ('rule_be_delete', 'DELETE_OBJECT', 'deleteBatteryElectrolyte', 'RESTFUL', 'DELETE', '/api/instances/battery_electrolyte/{id}', NOW(), NOW());

INSERT INTO ontology_rule_params (id, rule_id, param_direction, param_name, param_type, is_required, description, sort_order) VALUES
('rule_be_delete_in_0', 'rule_be_delete', 'INPUT', 'id', 'string', 1, '实例ID', 0),
('rule_be_delete_out_0', 'rule_be_delete', 'OUTPUT', 'success', 'boolean', 1, '操作是否成功', 0);
