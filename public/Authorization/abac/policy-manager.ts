import type { Action, Attribute, Policy, Resource } from "../core/types";
import type { PolicyRepository } from "./policy-repository";

export class PolicyManager {
  private readonly repo: PolicyRepository;

  constructor(repo?: PolicyRepository) {
    this.repo = repo ?? new InMemoryPolicyRepository();
  }

  async checkAccess(
    userId: string,
    resource: Resource,
    action: Action,
    contextAttributes: Attribute[],
  ): Promise<boolean> {
    const policies = await this.repo.findAllPolicies();
    const attributes = this.buildAttributes(
      userId,
      resource,
      action,
      contextAttributes,
    );

    // تقييم السياسات: إذا وُجدت سياسة DENY مطابقة → رفض
    const denyPolicies = policies.filter((p) => p.effect === "DENY");
    if (denyPolicies.some((p) => this.evaluatePolicy(p, attributes))) {
      return false;
    }

    // إذا وُجدت سياسة ALLOW مطابقة → سماح
    const allowPolicies = policies.filter((p) => p.effect === "ALLOW");
    return allowPolicies.some((p) => this.evaluatePolicy(p, attributes));
  }

  private buildAttributes(
    userId: string,
    resource: Resource,
    action: Action,
    context: Attribute[],
  ): Attribute[] {
    return [
      { key: "user.id", value: userId },
      { key: "resource", value: resource },
      { key: "action", value: action },
      { key: "time.hour", value: new Date().getHours() },
      ...context,
    ];
  }

  private evaluatePolicy(policy: Policy, attributes: Attribute[]): boolean {
    return policy.rules.every((rule) => this.evaluateRule(rule, attributes));
  }

  private evaluateRule(
    rule: { condition: "AND" | "OR"; conditions: any[] },
    attributes: Attribute[],
  ): boolean {
    const results = rule.conditions.map((cond) =>
      this.evaluateCondition(cond, attributes),
    );
    return rule.condition === "AND"
      ? results.every(Boolean)
      : results.some(Boolean);
  }

  private evaluateCondition(
    condition: { attribute: string; operator: any; value: any },
    attributes: Attribute[],
  ): boolean {
    const attr = attributes.find((a) => a.key === condition.attribute);
    if (!attr) return false;

    const { operator, value } = condition;
    const attrValue = attr.value;

    switch (operator) {
      case "==":
        return attrValue === value;
      case "!=":
        return attrValue !== value;
      case ">":
        return (
          typeof attrValue === "number" &&
          typeof value === "number" &&
          attrValue > value
        );
      case "<":
        return (
          typeof attrValue === "number" &&
          typeof value === "number" &&
          attrValue < value
        );
      case ">=":
        return (
          typeof attrValue === "number" &&
          typeof value === "number" &&
          attrValue >= value
        );
      case "<=":
        return (
          typeof attrValue === "number" &&
          typeof value === "number" &&
          attrValue <= value
        );
      case "IN":
        return Array.isArray(value) && value.includes(attrValue);
      case "NOT_IN":
        return Array.isArray(value) && !value.includes(attrValue);
      case "CONTAINS":
        return (
          typeof attrValue === "string" &&
          typeof value === "string" &&
          attrValue.includes(value)
        );
      default:
        return false;
    }
  }
}
