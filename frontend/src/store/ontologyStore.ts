export type PropertyType = "string" | "integer" | "double" | "boolean" | "date" | "timestamp" | "geohash";

export interface Property {
  id: string;
  name: string;
  type: PropertyType;
  description?: string;
  isPrimaryKey?: boolean;
  baseColumn?: string;
  typeClasses?: string[];
}

export interface ObjectType {
  id: string;
  name: string;
  description: string;
  icon: string;
  backingDataset: string;
  industryId?: string | null;
  properties: Property[];
  status?: string;
}

export type Cardinality = "1:1" | "1:N" | "N:M" | "N:1";

export interface LinkType {
  id: string;
  name: string;
  sourceObjectId: string;
  targetObjectId: string;
  cardinality: Cardinality;
  description?: string;
  industryId?: string | null;
  sourceColumn?: string;
  targetColumn?: string;
  status?: string;
}

export interface ActionRule {
  id: string;
  type: "validation" | "side_effect" | "webhook";
  description: string;
}

export interface ActionType {
  id: string;
  name: string;
  description: string;
  targetObjectId: string;
  industryId?: string | null;
  parameters: { name: string; type: PropertyType; required?: boolean }[];
  rules: ActionRule[];
}

export interface IndustryCategory {
  id: string;
  code: string;
  name: string;
  level: number;
  parent_id: string | null;
  sort_order: number;
  description: string;
  children?: IndustryCategory[];
}

export interface OntologyData {
  objectTypes: ObjectType[];
  linkTypes: LinkType[];
  actionTypes: ActionType[];
}

export const mockOntology: OntologyData = {
  objectTypes: [
    {
      id: "ot_employee",
      name: "Employee",
      description: "Represents an employee in the organization.",
      icon: "User",
      backingDataset: "ri.foundry.main.dataset.employees",
      properties: [
        { id: "p_emp_id", name: "Employee ID", type: "string", isPrimaryKey: true, baseColumn: "employee_id", typeClasses: ["kind:title"] },
        { id: "p_emp_name", name: "Full Name", type: "string", baseColumn: "full_name" },
        { id: "p_emp_role", name: "Role", type: "string", baseColumn: "job_role" },
        { id: "p_emp_start", name: "Start Date", type: "date", baseColumn: "start_date" },
        { id: "p_emp_salary", name: "Salary", type: "double", baseColumn: "annual_salary", typeClasses: ["format:currency"] },
        { id: "p_emp_active", name: "Is Active", type: "boolean", baseColumn: "is_active" },
      ]
    },
    {
      id: "ot_facility",
      name: "Facility",
      description: "Physical building or location.",
      icon: "Building2",
      backingDataset: "ri.foundry.main.dataset.facilities",
      properties: [
        { id: "p_fac_id", name: "Facility ID", type: "string", isPrimaryKey: true, baseColumn: "fac_id" },
        { id: "p_fac_name", name: "Name", type: "string", baseColumn: "facility_name", typeClasses: ["kind:title"] },
        { id: "p_fac_loc", name: "Location", type: "geohash", baseColumn: "coordinates" },
        { id: "p_fac_capacity", name: "Capacity", type: "integer", baseColumn: "max_capacity" },
      ]
    },
    {
      id: "ot_equipment",
      name: "Equipment",
      description: "Machinery or tools used in facilities.",
      icon: "Wrench",
      backingDataset: "ri.foundry.main.dataset.equipment",
      properties: [
        { id: "p_eq_id", name: "Equipment ID", type: "string", isPrimaryKey: true, baseColumn: "eq_id" },
        { id: "p_eq_name", name: "Name", type: "string", baseColumn: "eq_name", typeClasses: ["kind:title"] },
        { id: "p_eq_status", name: "Status", type: "string", baseColumn: "current_status" },
        { id: "p_eq_purchase_date", name: "Purchase Date", type: "date", baseColumn: "purchase_date" },
      ]
    },
    {
      id: "ot_maintenance_ticket",
      name: "Maintenance Ticket",
      description: "Record of maintenance performed on equipment.",
      icon: "Ticket",
      backingDataset: "ri.foundry.main.dataset.maintenance_tickets",
      properties: [
        { id: "p_mt_id", name: "Ticket ID", type: "string", isPrimaryKey: true, baseColumn: "ticket_id" },
        { id: "p_mt_desc", name: "Description", type: "string", baseColumn: "issue_description" },
        { id: "p_mt_date", name: "Date Filed", type: "timestamp", baseColumn: "filed_at" },
        { id: "p_mt_resolved", name: "Is Resolved", type: "boolean", baseColumn: "is_resolved" },
      ]
    }
  ],
  linkTypes: [
    {
      id: "lt_emp_fac",
      name: "Works At",
      sourceObjectId: "ot_employee",
      targetObjectId: "ot_facility",
      cardinality: "N:M",
      description: "Employees assigned to a facility."
    },
    {
      id: "lt_fac_eq",
      name: "Contains",
      sourceObjectId: "ot_facility",
      targetObjectId: "ot_equipment",
      cardinality: "1:N",
      description: "Equipment located in a facility."
    },
    {
      id: "lt_eq_mt",
      name: "Has Tickets",
      sourceObjectId: "ot_equipment",
      targetObjectId: "ot_maintenance_ticket",
      cardinality: "1:N",
      description: "Maintenance tickets filed for a piece of equipment."
    },
    {
      id: "lt_emp_mt",
      name: "Filed By",
      sourceObjectId: "ot_maintenance_ticket",
      targetObjectId: "ot_employee",
      cardinality: "N:1",
      description: "The employee who filed the maintenance ticket."
    }
  ],
  actionTypes: [
    {
      id: "act_update_eq_status",
      name: "Update Equipment Status",
      description: "Change the operational status of a piece of equipment.",
      targetObjectId: "ot_equipment",
      parameters: [
        { name: "New Status", type: "string", required: true },
        { name: "Reason", type: "string", required: false }
      ],
      rules: [
        { id: "r1", type: "validation", description: "Status must be one of: Active, Maintenance, Retired" },
        { id: "r2", type: "side_effect", description: "If Status is 'Maintenance', auto-create a Maintenance Ticket" }
      ]
    },
    {
      id: "act_onboard_emp",
      name: "Onboard Employee",
      description: "Create a new employee record and assign to a facility.",
      targetObjectId: "ot_employee",
      parameters: [
        { name: "Full Name", type: "string", required: true },
        { name: "Role", type: "string", required: true },
        { name: "Facility ID", type: "string", required: true }
      ],
      rules: [
        { id: "r3", type: "validation", description: "Facility ID must exist in ot_facility" }
      ]
    },
    {
      id: "act_file_ticket",
      name: "File Maintenance Ticket",
      description: "Create a new maintenance ticket for equipment.",
      targetObjectId: "ot_maintenance_ticket",
      parameters: [
        { name: "Equipment ID", type: "string", required: true },
        { name: "Description", type: "string", required: true }
      ],
      rules: [
        { id: "r4", type: "webhook", description: "Notify maintenance team via email" }
      ]
    }
  ]
};
