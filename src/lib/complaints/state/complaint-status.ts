// ✅ محسّن - إدارة حالة محسّنة
export const ComplaintStatus = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
  CLOSED: "closed",
  UNRESOLVED: "unresolved",
  ESCALATED: "escalated",
  ON_HOLD: "on_hold",
  REOPENED: "reopened",
} as const;

export type ComplaintStatusType = (typeof ComplaintStatus)[keyof typeof ComplaintStatus];

// ✅ استخدام Set للأداء والحفاظ على الأنواع
const finalStatuses = new Set<ComplaintStatusType>([
  ComplaintStatus.CLOSED,
  ComplaintStatus.RESOLVED,
  ComplaintStatus.UNRESOLVED,
]);

const closedStatuses = new Set<ComplaintStatusType>([ComplaintStatus.CLOSED, ComplaintStatus.UNRESOLVED]);

// ✅ انتقالات الحالة - منطقية
export const allowedTransitions: Record<ComplaintStatusType, ComplaintStatusType[]> = {
  [ComplaintStatus.OPEN]: [
    ComplaintStatus.IN_PROGRESS,
    ComplaintStatus.ON_HOLD,
    ComplaintStatus.ESCALATED,
    ComplaintStatus.CLOSED, // إغلاق بدون حل
  ],
  [ComplaintStatus.IN_PROGRESS]: [
    ComplaintStatus.RESOLVED,
    ComplaintStatus.ON_HOLD,
    ComplaintStatus.ESCALATED,
    ComplaintStatus.CLOSED, // إغلاق بدون حل
  ],
  [ComplaintStatus.RESOLVED]: [
    ComplaintStatus.CLOSED, // بعد الحل -> إغلاق
    ComplaintStatus.REOPENED, // إعادة فتح بعد الحل
  ],
  [ComplaintStatus.CLOSED]: [
    ComplaintStatus.REOPENED, // إعادة فتح مغلقة
  ],
  [ComplaintStatus.UNRESOLVED]: [
    ComplaintStatus.REOPENED, // إعادة فتح غير محلولة
  ],
  [ComplaintStatus.ESCALATED]: [ComplaintStatus.IN_PROGRESS, ComplaintStatus.ON_HOLD, ComplaintStatus.CLOSED],
  [ComplaintStatus.ON_HOLD]: [ComplaintStatus.IN_PROGRESS, ComplaintStatus.ESCALATED, ComplaintStatus.CLOSED],
  [ComplaintStatus.REOPENED]: [ComplaintStatus.IN_PROGRESS, ComplaintStatus.ON_HOLD, ComplaintStatus.CLOSED],
};

export function canTransition(current: ComplaintStatusType, next: ComplaintStatusType) {
  return allowedTransitions[current]?.includes(next);
}

// ✅ دالة مساعدة - هل الحالة نهائية؟
export function isFinalStatus(status: ComplaintStatusType): boolean {
  return finalStatuses.has(status);
}

// ✅ دالة مساعدة - هل الحالة نشطة؟
export function isActiveStatus(status: ComplaintStatusType): boolean {
  return !isFinalStatus(status);
}

// ✅ دالة مساعدة - هل تم حلها؟
export function isResolved(status: ComplaintStatusType): boolean {
  return status === ComplaintStatus.RESOLVED;
}

// ✅ دالة مساعدة - هل تم إغلاقها؟
export function isClosed(status: ComplaintStatusType): boolean {
  return closedStatuses.has(status);
}

// // ✅ محسّن - إدارة حالة محسّنة
// export const ComplaintStatus = {
//   OPEN: "open",
//   IN_PROGRESS: "in_progress",
//   RESOLVED: "resolved",
//   CLOSED: "closed",
//   UNRESOLVED: "unresolved",
//   ESCALATED: "escalated",
//   ON_HOLD: "on_hold",
//   REOPENED: "reopened",
// } as const;

// export type ComplaintStatusType = (typeof ComplaintStatus)[keyof typeof ComplaintStatus];

// // ✅ انتقالات الحالة - منطقية
// export const allowedTransitions: Record<ComplaintStatusType, ComplaintStatusType[]> = {
//   [ComplaintStatus.OPEN]: [
//     ComplaintStatus.IN_PROGRESS,
//     ComplaintStatus.ON_HOLD,
//     ComplaintStatus.ESCALATED,
//     ComplaintStatus.CLOSED, // إغلاق بدون حل
//   ],
//   [ComplaintStatus.IN_PROGRESS]: [
//     ComplaintStatus.RESOLVED,
//     ComplaintStatus.ON_HOLD,
//     ComplaintStatus.ESCALATED,
//     ComplaintStatus.CLOSED, // إغلاق بدون حل
//   ],
//   [ComplaintStatus.RESOLVED]: [
//     ComplaintStatus.CLOSED, // بعد الحل -> إغلاق
//     ComplaintStatus.REOPENED, // إعادة الفتح بعد الحل
//   ],
//   [ComplaintStatus.CLOSED]: [
//     ComplaintStatus.REOPENED, // إعادة فتح مغلقة
//   ],
//   [ComplaintStatus.UNRESOLVED]: [
//     ComplaintStatus.REOPENED, // إعادة فتح غير محلولة
//   ],
//   [ComplaintStatus.ESCALATED]: [ComplaintStatus.IN_PROGRESS, ComplaintStatus.ON_HOLD, ComplaintStatus.CLOSED],
//   [ComplaintStatus.ON_HOLD]: [ComplaintStatus.IN_PROGRESS, ComplaintStatus.ESCALATED, ComplaintStatus.CLOSED],
//   [ComplaintStatus.REOPENED]: [ComplaintStatus.IN_PROGRESS, ComplaintStatus.ON_HOLD, ComplaintStatus.CLOSED],
// };

// export function canTransition(current: ComplaintStatusType, next: ComplaintStatusType) {
//   return allowedTransitions[current]?.includes(next);
// }

// // ✅ دالة مساعدة - هل الحالة نهائية؟
// export function isFinalStatus(status: ComplaintStatusType): boolean {
//   return [ComplaintStatus.CLOSED, ComplaintStatus.RESOLVED, ComplaintStatus.UNRESOLVED].includes(status);
// }

// // ✅ دالة مساعدة - هل الحالة نشطة؟
// export function isActiveStatus(status: ComplaintStatusType): boolean {
//   return !isFinalStatus(status) && status !== ComplaintStatus.UNRESOLVED;
// }

// // ✅ دالة مساعدة - هل تم حلها؟
// export function isResolved(status: ComplaintStatusType): boolean {
//   return status === ComplaintStatus.RESOLVED;
// }

// // ✅ دالة مساعدة - هل تم إغلاقها؟
// export function isClosed(status: ComplaintStatusType): boolean {
//   return [ComplaintStatus.CLOSED, ComplaintStatus.UNRESOLVED].includes(status);
// }
