import type { Policy } from "@/lib/authorization/core/types";

export interface PolicyRepository {
  findAllPolicies(): Promise<Policy[]>;
}
