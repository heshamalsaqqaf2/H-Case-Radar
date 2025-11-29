# 📧 نظام البريد الإلكتروني - H-Case-Radar

نظام بريد إلكتروني احترافي، قابل للتوسع، ومُحسّن للأداء.

## 🎯 الميزات

- ✅ **Type-Safe بالكامل** - TypeScript + Zod
- ✅ **Logging شامل** - تسجيل كل عملية في قاعدة البيانات
- ✅ **Retry Logic** - إعادة محاولة تلقائية مع exponential backoff
- ✅ **Queue System** - نظام طابور للرسائل
- ✅ **Scheduling** - جدولة إرسال البريد
- ✅ **Batch Sending** - إرسال دفعي
- ✅ **Rate Limiting** - حماية من الإرسال الزائد
- ✅ **Connection Pooling** - تحسين الأداء
- ✅ **Test Mode** - نمط اختبار للتطوير
- ✅ **Statistics** - إحصائيات شاملة
- ✅ **Email Preferences** - تفضيلات المستخدم

## 📦 التثبيت

```bash
pnpm install
```

## ⚙️ الإعداد

### 1. متغيرات البيئة

أضف المتغيرات التالية في `.env.local`:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# From Address
SMTP_FROM=noreply@h-case-radar.com
SMTP_FROM_NAME=نظام إدارة الشكاوى

# Optional: Email Features
EMAIL_ENABLE_QUEUE=true
EMAIL_ENABLE_LOGGING=true
EMAIL_ENABLE_RETRY=true
EMAIL_MAX_ATTEMPTS=3
EMAIL_RETRY_DELAY=60000

# Optional: Test Mode
EMAIL_TEST_MODE=false
EMAIL_TEST_RECIPIENT=test@example.com

# Optional: Rate Limiting
EMAIL_RATE_LIMIT_PER_MINUTE=20
EMAIL_RATE_LIMIT_PER_HOUR=100
```

### 2. Database Migration

```bash
pnpm run db:generate
pnpm run db:migrate
```

## 🚀 الاستخدام

### الاستخدام الأساسي

```typescript
import { sendEmail, EMAIL_TEMPLATES } from "@/lib/services/email";

// إرسال بريد واحد
const result = await sendEmail({
  to: "user@example.com",
  subject: "مرحباً بك",
  template: EMAIL_TEMPLATES.WELCOME,
  templateData: {
    userName: "أحمد محمد",
    dashboardUrl: "https://app.com/dashboard",
  },
});

if (result.success) {
  console.log("تم الإرسال بنجاح:", result.messageId);
} else {
  console.error("فشل الإرسال:", result.error);
}
```

### القوالب المتاحة

#### 1. المصادقة والمستخدمين

```typescript
// بيانات الاعتماد
await sendEmail({
  to: "user@example.com",
  subject: "بيانات الدخول",
  template: EMAIL_TEMPLATES.CREDENTIALS,
  templateData: {
    userName: "أحمد",
    email: "ahmed@example.com",
    password: "temp123",
    loginUrl: "https://app.com/sign-in",
  },
});

// ترحيب
await sendEmail({
  to: "user@example.com",
  subject: "مرحباً بك",
  template: EMAIL_TEMPLATES.WELCOME,
  templateData: {
    userName: "أحمد",
    dashboardUrl: "https://app.com/dashboard",
  },
});

// إعادة تعيين كلمة المرور
await sendEmail({
  to: "user@example.com",
  subject: "إعادة تعيين كلمة المرور",
  template: EMAIL_TEMPLATES.PASSWORD_RESET,
  templateData: {
    userName: "أحمد",
    resetUrl: "https://app.com/reset/token-xxx",
    expiresIn: "1 ساعة",
  },
});

// تأكيد البريد
await sendEmail({
  to: "user@example.com",
  subject: "تأكيد البريد الإلكتروني",
  template: EMAIL_TEMPLATES.EMAIL_VERIFICATION,
  templateData: {
    userName: "أحمد",
    verificationUrl: "https://app.com/verify/token-xxx",
    expiresIn: "24 ساعة",
  },
});

// حالة الحساب
await sendEmail({
  to: "user@example.com",
  subject: "تم الموافقة على حسابك",
  template: EMAIL_TEMPLATES.ACCOUNT_APPROVED,
  templateData: {
    userName: "أحمد",
    status: "approved",
    loginUrl: "https://app.com/sign-in",
  },
});
```

#### 2. الشكاوى

```typescript
// تعيين شكوى
await sendEmail({
  to: "employee@example.com",
  subject: "شكوى جديدة",
  template: EMAIL_TEMPLATES.COMPLAINT_ASSIGNED,
  templateData: {
    userName: "محمد",
    complaintId: "uuid-xxx",
    complaintTitle: "مشكلة في النظام",
    category: "فنية",
    priority: "عالية",
    assignedBy: "أحمد المدير",
    dueDate: "2024-12-01",
    complaintUrl: "https://app.com/complaints/uuid",
  },
});

// تحديث الحالة
await sendEmail({
  to: "customer@example.com",
  subject: "تحديث حالة الشكوى",
  template: EMAIL_TEMPLATES.COMPLAINT_STATUS_UPDATED,
  templateData: {
    userName: "عميل",
    complaintId: "uuid-xxx",
    complaintTitle: "مشكلة في النظام",
    oldStatus: "قيد التنفيذ",
    newStatus: "تم الحل",
    updatedBy: "محمد الموظف",
    complaintUrl: "https://app.com/complaints/uuid",
  },
});

// حل الشكوى
await sendEmail({
  to: "customer@example.com",
  subject: "تم حل شكواك",
  template: EMAIL_TEMPLATES.COMPLAINT_RESOLVED,
  templateData: {
    userName: "عميل",
    complaintId: "uuid-xxx",
    complaintTitle: "مشكلة في النظام",
    resolvedBy: "محمد الموظف",
    resolutionNotes: "تم حل المشكلة بنجاح",
    resolutionTime: "يومين",
    complaintUrl: "https://app.com/complaints/uuid",
  },
});
```

#### 3. SLA

```typescript
// تحذير SLA
await sendEmail({
  to: "employee@example.com",
  subject: "⚠️ تحذير: اقتراب انتهاء SLA",
  template: EMAIL_TEMPLATES.SLA_WARNING,
  priority: "urgent",
  templateData: {
    userName: "محمد",
    complaintId: "uuid-xxx",
    complaintTitle: "مشكلة حرجة",
    priority: "حرجة",
    remainingTime: "30 دقيقة",
    dueDate: "2024-12-01 15:00",
    complaintUrl: "https://app.com/complaints/uuid",
  },
});

// تجاوز SLA
await sendEmail({
  to: "manager@example.com",
  subject: "🚨 تم تجاوز SLA",
  template: EMAIL_TEMPLATES.SLA_EXCEEDED,
  priority: "urgent",
  templateData: {
    managerName: "أحمد المدير",
    complaintId: "uuid-xxx",
    complaintTitle: "مشكلة حرجة",
    priority: "حرجة",
    assignedTo: "محمد الموظف",
    exceededBy: "ساعتين",
    complaintUrl: "https://app.com/complaints/uuid",
  },
});
```

### الميزات المتقدمة

#### الإرسال الدفعي

```typescript
import { sendBatchEmails } from "@/lib/services/email";

const emails = [
  {
    to: "user1@example.com",
    subject: "تقرير أسبوعي",
    template: EMAIL_TEMPLATES.WEEKLY_REPORT,
    templateData: { /* ... */ },
  },
  {
    to: "user2@example.com",
    subject: "تقرير أسبوعي",
    template: EMAIL_TEMPLATES.WEEKLY_REPORT,
    templateData: { /* ... */ },
  },
];

const results = await sendBatchEmails(emails);
console.log(`نجح: ${results.filter(r => r.success).length}/${results.length}`);
```

#### الجدولة

```typescript
// إرسال في المستقبل
await sendEmail({
  to: "user@example.com",
  subject: "تذكير",
  template: EMAIL_TEMPLATES.WELCOME,
  templateData: { /* ... */ },
  scheduledAt: new Date("2024-12-01 10:00:00"),
});
```

#### الأولوية

```typescript
await sendEmail({
  to: "manager@example.com",
  subject: "عاجل جداً",
  template: EMAIL_TEMPLATES.COMPLAINT_ESCALATED,
  priority: "urgent", // low, normal, high, urgent
  templateData: { /* ... */ },
});
```

#### البيانات الوصفية

```typescript
await sendEmail({
  to: "user@example.com",
  subject: "إشعار",
  template: EMAIL_TEMPLATES.WELCOME,
  templateData: { /* ... */ },
  userId: "user-uuid",
  metadata: {
    source: "automated",
    campaign: "onboarding",
    tags: ["new-user", "verification"],
  },
});
```

## 🔧 الخدمات المتقدمة

### إعادة محاولة الرسائل الفاشلة

```typescript
import { emailService } from "@/lib/services/email";

// إعادة محاولة تلقائية
const retried = await emailService.retryFailed(50); // max 50
console.log(`تم إعادة محاولة ${retried} رسالة`);
```

### معالجة الرسائل المعلقة

```typescript
// معالجة الرسائل في الطابور
const processed = await emailService.processPending(100);
console.log(`تم معالجة ${processed} رسالة`);
```

### الإحصائيات

```typescript
// إحصائيات شاملة
const stats = await emailService.getStatistics();
console.log(stats);
// {
//   total: 1000,
//   sent: 950,
//   failed: 30,
//   pending: 20,
//   queued: 0,
//   successRate: 95
// }

// إحصائيات لفترة محددة
const monthStats = await emailService.getStatistics(
  new Date("2024-11-01"),
  new Date("2024-11-30")
);
```

### التحقق من الاتصال

```typescript
const isConnected = await emailService.verifyConnection();
if (isConnected) {
  console.log("✅ الاتصال بخادم البريد ناجح");
} else {
  console.error("❌ فشل الاتصال بخادم البريد");
}
```

### التنظيف التلقائي

```typescript
// حذف السجلات الأقدم من 90 يوم
const deleted = await emailService.cleanupOldLogs(90);
console.log(`تم حذف ${deleted} سجل قديم`);
```

## 📊 قاعدة البيانات

### جدول email_logs

يحتوي على سجل كامل لكل بريد:

- معلومات المرسل/المستقبل (to, from, cc, bcc)
- المحتوى (subject, template, templateData)
- الحالة (status, attempts, errorMessage)
- التوقيت (createdAt, sentAt, failedAt, scheduledAt)
- البيانات الوصفية (userId, metadata, priority)
- التتبع (opened, clicked) - للمستقبل

### جدول email_preferences

تفضيلات المستخدم:

- تفعيل/تعطيل البريد
- تفضيلات مفصلة لكل نوع
- أوقات الهدوء
- تكرار التقارير

## 🧪 الاختبار

### نمط الاختبار

```env
EMAIL_TEST_MODE =true
EMAIL_TEST_RECIPIENT=test@example.com
```

جميع الرسائل سترسل إلى `test@example.com` بدلاً من المستلم الفعلي.

### مثال اختبار

```typescript
// في بيئة التطوير مع TEST_MODE=true
await sendEmail({
  to: "actual-user@example.com", // ← سيتم تجاهله
  // ...سيُرسل إلى test@example.com بدلاً منه
});
```

## 📝 الأمثلة

### مثال: نظام إشعارات الشكاوى
```typescript
// عند إنشاء شكوى
export async function onComplaintCreated(complaint, submitter) {
  await sendEmail({
    to: submitter.email,
    subject: `تم استلام شكواك: ${complaint.title}`,
    template: EMAIL_TEMPLATES.COMPLAINT_CREATED,
    templateData: {
      userName: submitter.name,
      complaintId: complaint.id,
      complaintTitle: complaint.title,
      category: complaint.category,
      priority: complaint.priority,
      complaintUrl: `${process.env.NEXT_PUBLIC_APP_URL}/complaints/${complaint.id}`,
    },
    userId: submitter.id,
    metadata: {
      complaintId: complaint.id,
      action: "complaint_created",
    },
  });
}

// عند تعيين شكوى
export async function onComplaintAssigned(complaint, employee, assigner) {
  await sendEmail({
    to: employee.email,
    subject: `شكوى جديدة تم تعيينها لك`,
    template: EMAIL_TEMPLATES.COMPLAINT_ASSIGNED,
    priority: complaint.priority === "critical" ? "urgent" : "normal",
    templateData: {
      userName: employee.name,
      complaintId: complaint.id,
      complaintTitle: complaint.title,
      category: complaint.category,
      priority: complaint.priority,
      assignedBy: assigner.name,
      dueDate: complaint.responseDueAt?.toLocaleDateString("ar"),
      complaintUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin/complaints/${complaint.id}`,
    },
    userId: employee.id,
  });
}
```

## 🔒 الأمان

- ✅ التحقق من البيانات باستخدام Zod
- ✅ Rate limiting لمنع الإرسال الزائد
- ✅ Connection pooling آمن
- ✅ Error handling شامل
- ✅ Test mode لعدم إرسال رسائل فعلية في التطوير

## ⚡ الأداء

- ✅ Connection pooling
- ✅ Batch sending
- ✅ Queue system
- ✅ Rate limiting
- ✅ Retry مع exponential backoff
- ✅ Database indexing (للمستقبل)

## 🐛 المشاكل الشائعة

### 1. "Transporter not initialized"
**الحل:** تأكد من إعداد متغيرات البيئة صحيحة

### 2. "Invalid login: 535 Authentication failed"
**الحل:** استخدم App Password لـ Gmail، ليس كلمة المرور العادية

### 3. "Email sending is disabled"
**الحل:** تأكد من `NODE_ENV=production` أو اضبط الإعدادات

## 📚 المراجع

- [Nodemailer Documentation](https://nodemailer.com/)
- [Zod Documentation](https://zod.dev/)
- [Drizzle ORM](https://orm.drizzle.team/)

## 🤝 المساهمة

لإضافة قالب جديد:

1. أضف النوع في `email-types.ts`
2. أضف البيانات interface في `email-types.ts`
3. أضف Zod schema في `email-schemas.ts`
4. أنشئ القالب في `templates/`
5. اختبر!

## 📄 الترخيص

MIT License

---

**المطور:** Antigravity AI  
**التاريخ:** 2024-11-30  
**الحالة:** ✅ Production Ready (بعد إضافة القوالب)
