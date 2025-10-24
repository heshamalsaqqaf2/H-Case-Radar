export type Resource = string;
export type Action = string;

export interface Permission {
  resource: Resource;
  action: Action;
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AttributeKey = string;
export type AttributeValue = string | number | boolean;

export interface Attribute {
  key: AttributeKey;
  value: AttributeValue;
}

export type Operator =
  | "=="
  | "!="
  | ">"
  | "<"
  | ">="
  | "<="
  | "IN"
  | "NOT_IN"
  | "CONTAINS";

export interface Condition {
  attribute: AttributeKey;
  operator: Operator;
  value: AttributeValue | AttributeValue[];
}

export interface PolicyRule {
  condition: "AND" | "OR";
  conditions: Condition[];
}

export type PolicyEffect = "ALLOW" | "DENY";

export interface Policy {
  id: string;
  name: string;
  description: string;
  rules: PolicyRule[];
  effect: PolicyEffect;
  createdAt: Date;
  updatedAt: Date;
}
