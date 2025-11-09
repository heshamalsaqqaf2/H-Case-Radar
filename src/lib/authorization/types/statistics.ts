export interface StatisticsData {
  // ========== Identity & Access ==========
  totalUsers: number;
  activeUsers: number; // lastLoginAt خلال آخر 24 ساعة
  blockedUsers: number; // banned = true
  newUsers7Days: number;
  newUsers30Days: number;
  totalRoles: number;
  totalPermissions: number;
  usersByRole: { roleName: string; count: number }[];

  // ========== Security ==========
  failedLoginAttempts24h: number; // من audit_log
  activeSessions: number; // جلسات غير منتهية
  sessionsByIp: { ipAddress: string | null; count: number }[];

  // ========== System ==========
  uptime: string;
  averageResponseTimeMs: number;
  dailyRequests: number;

  // ========== Audit Trail ==========
  recentActivity: {
    id: string;
    actor: string; // email المستخدم
    action: string; // مثل "role.create"
    target: string; // معرف الكيان
    timestamp: Date;
  }[];
}
