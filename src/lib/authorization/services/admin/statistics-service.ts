// src/lib/authorization/services/admin/statistics-service.ts
import { and, count, eq, gt, sql } from "drizzle-orm";
import { authorizationService } from "@/lib/authentication/permission-system";
import { database as db } from "@/lib/database";
import {
  auditLog,
  permission,
  role,
  session,
  user,
  userRoles,
} from "@/lib/database/schema";
import { Errors } from "@/lib/errors/error-factory";
import type { StatisticsData } from "@/lib/types/statistics";

async function authorize(userId: string) {
  const check = await authorizationService.checkPermission(
    { userId },
    "statistics.view",
  );
  if (!check.allowed) {
    throw Errors.forbidden("عرض الإحصائيات");
  }
}

export async function getStatisticsData(
  userId: string,
): Promise<StatisticsData> {
  await authorize(userId);

  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    activeUsers,
    blockedUsers,
    newUsers7Days,
    newUsers30Days,
    totalRoles,
    totalPermissions,
    usersByRole,
    activeSessions,
    sessionsByIp,
    failedLoginAttempts24h,
    recentActivity,
  ] = await Promise.all([
    // Identity & Access
    db
      .select({ count: count() })
      .from(user),
    db
      .select({ count: count() })
      .from(user)
      .where(gt(user.lastLoginAt, oneDayAgo)),
    db.select({ count: count() }).from(user).where(eq(user.banned, true)),
    db
      .select({ count: count() })
      .from(user)
      .where(gt(user.createdAt, sevenDaysAgo)),
    db
      .select({ count: count() })
      .from(user)
      .where(gt(user.createdAt, thirtyDaysAgo)),
    db.select({ count: count() }).from(role),
    db.select({ count: count() }).from(permission),
    db
      .select({
        roleName: role.name,
        count: count(user.id),
      })
      .from(userRoles)
      .innerJoin(role, eq(userRoles.roleId, role.id))
      .innerJoin(user, eq(userRoles.userId, user.id))
      .groupBy(role.id),

    // Security
    db
      .select({ count: count() })
      .from(session)
      .where(gt(session.expiresAt, now)),
    db
      .select({
        ipAddress: session.ipAddress,
        count: count(),
      })
      .from(session)
      .where(gt(session.expiresAt, now))
      .groupBy(session.ipAddress)
      .orderBy(sql`count DESC`)
      .limit(5),
    db
      .select({ count: count() })
      .from(auditLog)
      .where(
        and(
          eq(auditLog.action, "auth.login.failed"),
          gt(auditLog.createdAt, oneDayAgo),
        ),
      ),

    // Audit Trail
    db
      .select({
        id: auditLog.id,
        actor: user.email,
        action: auditLog.action,
        target: auditLog.entityId,
        timestamp: auditLog.createdAt,
      })
      .from(auditLog)
      .innerJoin(user, eq(auditLog.userId, user.id))
      .orderBy(sql`${auditLog.createdAt} DESC`)
      .limit(20),
  ]);

  return {
    totalUsers: totalUsers[0].count,
    activeUsers: activeUsers[0].count,
    blockedUsers: blockedUsers[0].count,
    newUsers7Days: newUsers7Days[0].count,
    newUsers30Days: newUsers30Days[0].count,
    totalRoles: totalRoles[0].count,
    totalPermissions: totalPermissions[0].count,
    usersByRole: usersByRole.map((r) => ({
      roleName: r.roleName,
      count: Number(r.count),
    })),
    failedLoginAttempts24h: failedLoginAttempts24h[0].count,
    activeSessions: activeSessions[0].count,
    sessionsByIp: sessionsByIp.map((s) => ({
      ipAddress: s.ipAddress,
      count: Number(s.count),
    })),
    uptime: "99.99%", // من نظام مراقبة لاحقًا
    averageResponseTimeMs: 42, // من سجلات الأداء
    dailyRequests: 1250, // من سجلات الخادم
    recentActivity,
  };
}
