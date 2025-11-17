// components/account-status-screen.tsx
/** biome-ignore-all lint/suspicious/noArrayIndexKey: <> */
"use client";

import { motion, useInView } from "framer-motion";
import { AlertCircle, ArrowRight, CheckCircle, Clock, Mail, RotateCcw, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface ProfessionalWaitingScreenProps {
  variant?: "pending" | "approved" | "rejected";
  message?: string;
  subtitle?: string;
  delay?: number;
  className?: string;
  onAction?: () => void;
  actionText?: string;
  showRefreshButton?: boolean;
  onRefresh?: () => void;
}

const messages = {
  pending: [
    "نعمل على حسابك الآن",
    "جاري مراجعة بياناتك من قبل فريق الدعم",
    "نحرص على دقة كل تفاصيل حسابك",
    "الحساب قيد المراجعة — سنُبلغك قريبًا",
    "كل شيء تحت المراقبة — لا داعي للقلق",
  ],
  approved: [
    "تمت الموافقة على حسابك — أهلاً بك!",
    "حسابك جاهز للدخول — نرحب بك في النظام",
    "تم تفعيل حسابك بنجاح — ابدأ الآن",
  ],
  rejected: [
    "عذرًا، لم تُقبل طلباتك حاليًا",
    "نأسف لعدم إمكانية تفعيل حسابك في هذه المرحلة",
    "يرجى التواصل مع الدعم لمزيد من المعلومات",
  ],
};

const icons = {
  pending: { icon: Clock, size: "h-12 w-12", animated: true },
  approved: { icon: CheckCircle, size: "h-12 w-12", animated: true },
  rejected: { icon: AlertCircle, size: "h-12 w-12", animated: true },
};

const themes = {
  pending: {
    bg: "bg-gradient-to-br from-blue-50/70 via-indigo-50/50 to-slate-50/70 dark:from-slate-900/70 dark:via-slate-800/60 dark:to-slate-900/70",
    text: "text-slate-800 dark:text-slate-100",
    icon: "text-blue-600 dark:text-blue-400",
    border: "border border-blue-200/40 dark:border-blue-900/40",
    ring: "ring-blue-300/20 dark:ring-blue-800/20",
    accent: "from-blue-500/90 to-indigo-600/90",
    glow: "shadow-blue-500/20 dark:shadow-blue-900/20",
    particle: "bg-blue-500/20",
    button: "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700",
  },
  approved: {
    bg: "bg-gradient-to-br from-green-50/70 via-emerald-50/50 to-slate-50/70 dark:from-emerald-900/50 dark:via-emerald-950/50 dark:to-slate-900/70",
    text: "text-slate-800 dark:text-slate-100",
    icon: "text-green-600 dark:text-green-400",
    border: "border border-green-200/40 dark:border-green-900/40",
    ring: "ring-green-300/20 dark:ring-green-800/20",
    accent: "from-green-500/90 to-emerald-600/90",
    glow: "shadow-green-500/20 dark:shadow-green-900/20",
    particle: "bg-green-500/20",
    button: "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700",
  },
  rejected: {
    bg: "bg-gradient-to-br from-red-50/70 via-rose-50/50 to-slate-50/70 dark:from-rose-900/50 dark:via-rose-950/50 dark:to-slate-900/70",
    text: "text-slate-800 dark:text-slate-100",
    icon: "text-red-600 dark:text-red-400",
    border: "border border-red-200/40 dark:border-red-900/40",
    ring: "ring-red-300/20 dark:ring-red-800/20",
    accent: "from-red-500/90 to-rose-600/90",
    glow: "shadow-red-500/20 dark:shadow-red-900/20",
    particle: "bg-red-500/20",
    button: "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700",
  },
};

const FloatingParticle = ({ theme, delay }: { theme: string; delay: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  const particleTheme = themes[theme as keyof typeof themes];

  return (
    <motion.div
      ref={ref}
      className={`absolute w-2 h-2 rounded-full ${particleTheme.particle}`}
      initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
      animate={
        inView
          ? {
              opacity: [0.2, 0.8, 0.2],
              scale: [0, 1, 0],
              x: Math.random() * 200 - 100,
              y: Math.random() * 200 - 100,
            }
          : {}
      }
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      }}
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
    />
  );
};

export function ProfessionalWaitingScreen({
  variant = "pending",
  message,
  subtitle,
  delay = 300,
  className = "",
  onAction,
  actionText = "الانتقال إلى الصفحة الرئيسية",
  showRefreshButton = false,
  onRefresh,
}: ProfessionalWaitingScreenProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(message || messages[variant][0]);
  const [isHovered, setIsHovered] = useState(false);

  const { icon: Icon, size: _iconSize, animated } = icons[variant];
  const theme = themes[variant];

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  // تغيير الرسالة تلقائيًا في حالة الانتظار
  useEffect(() => {
    if (variant === "pending" && !message) {
      const interval = setInterval(() => {
        setCurrentMessage((prev) => {
          const availableMessages = messages[variant].filter((msg) => msg !== prev);
          if (availableMessages.length > 0) {
            return availableMessages[Math.floor(Math.random() * availableMessages.length)];
          }
          return prev;
        });
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [variant, message]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xl dark:bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -30 }}
        transition={{
          duration: 0.5,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        className={`relative flex flex-col items-center gap-6 p-8 sm:p-10 rounded-2xl shadow-2xl ${theme.bg} ${theme.border} ${theme.ring} ring-1 ${theme.glow} shadow-lg ${className}`}
        whileHover={variant === "pending" ? { scale: 1.01 } : undefined}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* الخلفية الثابتة */}
        <div
          className={`absolute inset-0 rounded-2xl bg-linear-to-br ${theme.accent} opacity-5 blur-3xl -z-20`}
        />

        {/* الجسيمات العائمة */}
        {Array.from({ length: 8 }).map((_, i) => (
          <FloatingParticle key={i} theme={variant} delay={i * 0.2} />
        ))}

        {/* الزينة الدائرية */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden -z-10">
          <div
            className={`absolute -top-4 -right-4 w-32 h-32 rounded-full ${theme.particle} opacity-20 blur-xl`}
          ></div>
          <div
            className={`absolute -bottom-4 -left-4 w-32 h-32 rounded-full ${theme.particle} opacity-20 blur-xl`}
          ></div>
        </div>

        {/* الأيقونة المركزية */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotate: -180 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 10 }}
          className="flex items-center justify-center p-6 rounded-full bg-white/70 dark:bg-slate-800/60 shadow-lg backdrop-blur-sm relative z-10"
        >
          {animated ? (
            <motion.div
              animate={variant === "approved" ? { scale: [1, 1.1, 1] } : { rotate: [0, 5, -5, 0] }}
              transition={{
                duration: 2,
                repeat: variant === "approved" ? 1 : Infinity,
                repeatType: "reverse",
              }}
            >
              <Icon className={`h-12 w-12 ${theme.icon}`} aria-hidden="true" />
            </motion.div>
          ) : (
            <Icon className={`h-12 w-12 ${theme.icon}`} aria-hidden="true" />
          )}
          {variant === "approved" && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 15 }}
              className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1"
            >
              <Sparkles className="h-4 w-4 text-white" />
            </motion.div>
          )}
        </motion.div>

        {/* العنوان الرئيسي */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-center relative z-10"
        >
          <h2 className={`text-2xl sm:text-3xl font-bold ${theme.text} relative`}>
            {variant === "pending"
              ? "جاري مراجعة حسابك"
              : variant === "approved"
                ? "تم تفعيل الحساب!"
                : "حالة الحساب"}
            {variant === "approved" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 15 }}
                className="absolute -top-2 -right-4"
              >
                <Sparkles className="h-6 w-6 text-yellow-400" />
              </motion.div>
            )}
          </h2>
        </motion.div>

        {/* الرسالة التفصيلية */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className={`text-center text-lg sm:text-xl leading-relaxed max-w-md ${theme.text} relative z-10`}
        >
          {currentMessage}
        </motion.p>

        {/* التوضيح الإضافي */}
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className={`text-center text-sm sm:text-base italic ${theme.text}/80 relative z-10`}
          >
            {subtitle}
          </motion.p>
        )}

        {/* زر الإجراء عند الموافقة */}
        {variant === "approved" && onAction && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5, type: "spring", stiffness: 150, damping: 15 }}
            className="mt-4 w-full max-w-xs relative z-10"
          >
            <Button
              onClick={onAction}
              className={`w-full py-4 text-lg font-semibold ${theme.button} text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2`}
              size="lg"
            >
              {actionText}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </motion.div>
        )}

        {/* مؤشر التقدم في حالة الانتظار */}
        {variant === "pending" && (
          <motion.div
            className="mt-6 w-full max-w-md relative z-10"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            <div className="flex h-2 overflow-hidden rounded-full bg-slate-200/50 dark:bg-slate-700/50 relative">
              <motion.div
                className={`h-full bg-linear-to-r ${theme.accent} rounded-full`}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1,
                  ease: "linear",
                }}
              />
            </div>
          </motion.div>
        )}

        {/* زر التحديث (اختياري) */}
        {showRefreshButton && onRefresh && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="mt-4 relative z-10"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className={`flex items-center gap-2 ${theme.border} ${theme.text} hover:bg-slate-100/50 dark:hover:bg-slate-700/50`}
            >
              <RotateCcw className={`h-4 w-4 ${isHovered ? "animate-spin" : ""}`} />
              تحديث الحالة
            </Button>
          </motion.div>
        )}

        {/* تلميح في حالة الانتظار */}
        {variant === "pending" && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="mt-4 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 relative z-10 flex items-center justify-center gap-2"
          >
            <Clock className="h-4 w-4" />
            لا تغلق هذه الصفحة — سيتم تحديث الحالة تلقائيًا.
          </motion.p>
        )}

        {/* تلميح في حالة الرفض */}
        {variant === "rejected" && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="mt-4 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2 relative z-10"
          >
            <Mail className="h-4 w-4" />
            يرجى التواصل مع الدعم عبر البريد: support@h-case-radar.com
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}

// // components/account-status-screen.tsx
// /** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
// "use client";

// import { motion, useInView } from "framer-motion";
// import { AlertCircle, ArrowRight, CheckCircle, Clock, Mail, RotateCcw, Sparkles } from "lucide-react";
// import { useEffect, useRef, useState } from "react";
// import { Button } from "@/components/ui/button";

// interface ProfessionalWaitingScreenProps {
//   variant?: "pending" | "approved" | "rejected";
//   message?: string;
//   subtitle?: string;
//   delay?: number;
//   className?: string;
//   onAction?: () => void;
//   actionText?: string;
//   showRefreshButton?: boolean;
//   onRefresh?: () => void;
// }

// const messages = {
//   pending: [
//     "نعمل على حسابك الآن",
//     "جاري مراجعة بياناتك من قبل فريق الدعم",
//     "نحرص على دقة كل تفاصيل حسابك",
//     "الحساب قيد المراجعة — سنُبلغك قريبًا",
//     "كل شيء تحت المراقبة — لا داعي للقلق",
//   ],
//   approved: [
//     "تمت الموافقة على حسابك — أهلاً بك!",
//     "حسابك جاهز للدخول — نرحب بك في النظام",
//     "تم تفعيل حسابك بنجاح — ابدأ الآن",
//   ],
//   rejected: [
//     "عذرًا، لم تُقبل طلباتك حاليًا",
//     "نأسف لعدم إمكانية تفعيل حسابك في هذه المرحلة",
//     "يرجى التواصل مع الدعم لمزيد من المعلومات",
//   ],
// };

// const icons = {
//   pending: { icon: Clock, size: "h-12 w-12", animated: true },
//   approved: { icon: CheckCircle, size: "h-12 w-12", animated: true },
//   rejected: { icon: AlertCircle, size: "h-12 w-12", animated: true },
// };

// const themes = {
//   pending: {
//     bg: "bg-gradient-to-br from-blue-50/70 via-indigo-50/50 to-slate-50/70 dark:from-slate-900/70 dark:via-slate-800/60 dark:to-slate-900/70",
//     text: "text-slate-800 dark:text-slate-100",
//     icon: "text-blue-600 dark:text-blue-400",
//     border: "border border-blue-200/40 dark:border-blue-900/40",
//     ring: "ring-blue-300/20 dark:ring-blue-800/20",
//     accent: "from-blue-500/90 to-indigo-600/90",
//     glow: "shadow-blue-500/20 dark:shadow-blue-900/20",
//     particle: "bg-blue-500/20",
//     button: "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700",
//   },
//   approved: {
//     bg: "bg-gradient-to-br from-green-50/70 via-emerald-50/50 to-slate-50/70 dark:from-emerald-900/50 dark:via-emerald-950/50 dark:to-slate-900/70",
//     text: "text-slate-800 dark:text-slate-100",
//     icon: "text-green-600 dark:text-green-400",
//     border: "border border-green-200/40 dark:border-green-900/40",
//     ring: "ring-green-300/20 dark:ring-green-800/20",
//     accent: "from-green-500/90 to-emerald-600/90",
//     glow: "shadow-green-500/20 dark:shadow-green-900/20",
//     particle: "bg-green-500/20",
//     button: "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700",
//   },
//   rejected: {
//     bg: "bg-gradient-to-br from-red-50/70 via-rose-50/50 to-slate-50/70 dark:from-rose-900/50 dark:via-rose-950/50 dark:to-slate-900/70",
//     text: "text-slate-800 dark:text-slate-100",
//     icon: "text-red-600 dark:text-red-400",
//     border: "border border-red-200/40 dark:border-red-900/40",
//     ring: "ring-red-300/20 dark:ring-red-800/20",
//     accent: "from-red-500/90 to-rose-600/90",
//     glow: "shadow-red-500/20 dark:shadow-red-900/20",
//     particle: "bg-red-500/20",
//     button: "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700",
//   },
// };

// const FloatingParticle = ({ theme, delay }: { theme: string; delay: number }) => {
//   const ref = useRef<HTMLDivElement>(null);
//   const inView = useInView(ref, { once: true });

//   const particleTheme = themes[theme as keyof typeof themes];

//   return (
//     <motion.div
//       ref={ref}
//       className={`absolute w-2 h-2 rounded-full ${particleTheme.particle}`}
//       initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
//       animate={
//         inView
//           ? {
//               opacity: [0.2, 0.8, 0.2],
//               scale: [0, 1, 0],
//               x: Math.random() * 200 - 100,
//               y: Math.random() * 200 - 100,
//             }
//           : {}
//       }
//       transition={{
//         duration: 4,
//         delay,
//         repeat: Infinity,
//         repeatType: "reverse",
//         ease: "easeInOut",
//       }}
//       style={{
//         left: `${Math.random() * 100}%`,
//         top: `${Math.random() * 100}%`,
//       }}
//     />
//   );
// };

// export function ProfessionalWaitingScreen({
//   variant = "pending",
//   message,
//   subtitle,
//   delay = 300,
//   className = "",
//   onAction,
//   actionText = "الانتقال إلى الصفحة الرئيسية",
//   showRefreshButton = false,
//   onRefresh,
// }: ProfessionalWaitingScreenProps) {
//   const [isVisible, setIsVisible] = useState(false);
//   const [currentMessage, setCurrentMessage] = useState(message || messages[variant][0]);
//   const [isHovered, setIsHovered] = useState(false);

//   const { icon: Icon, size: _iconSize, animated } = icons[variant];
//   const theme = themes[variant];

//   useEffect(() => {
//     const timer = setTimeout(() => setIsVisible(true), delay);
//     return () => clearTimeout(timer);
//   }, [delay]);

//   // تغيير الرسالة تلقائيًا في حالة الانتظار
//   useEffect(() => {
//     if (variant === "pending" && !message) {
//       const interval = setInterval(() => {
//         setCurrentMessage((prev) => {
//           const availableMessages = messages[variant].filter((msg) => msg !== prev);
//           if (availableMessages.length > 0) {
//             return availableMessages[Math.floor(Math.random() * availableMessages.length)];
//           }
//           return prev;
//         });
//       }, 4000);

//       return () => clearInterval(interval);
//     }
//   }, [variant, message]);

//   if (!isVisible) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xl dark:bg-black/50">
//       {/* إزالة container div مع ref و useScroll */}
//       <motion.div
//         initial={{ opacity: 0, scale: 0.9, y: 30 }}
//         animate={{ opacity: 1, scale: 1, y: 0 }}
//         exit={{ opacity: 0, scale: 0.9, y: -30 }}
//         transition={{
//           duration: 0.5,
//           ease: [0.25, 0.46, 0.45, 0.94],
//         }}
//         className={`relative flex flex-col items-center gap-6 p-8 sm:p-10 rounded-2xl shadow-2xl ${theme.bg} ${theme.border} ${theme.ring} ring-1 ${theme.glow} shadow-lg ${className}`}
//         whileHover={variant === "pending" ? { scale: 1.01 } : undefined}
//         onHoverStart={() => setIsHovered(true)}
//         onHoverEnd={() => setIsHovered(false)}
//       >
//         {/* الخلفية الثابتة (بدلاً من المتحركة) */}
//         <div
//           className={`absolute inset-0 rounded-2xl bg-linear-to-br ${theme.accent} opacity-5 blur-3xl -z-20`}
//         />

//         {/* الجسيمات العائمة */}
//         {Array.from({ length: 8 }).map((_, i) => (
//           <FloatingParticle key={i} theme={variant} delay={i * 0.2} />
//         ))}

//         {/* الزينة الدائرية */}
//         <div className="absolute inset-0 rounded-2xl overflow-hidden -z-10">
//           <div
//             className={`absolute -top-4 -right-4 w-32 h-32 rounded-full ${theme.particle} opacity-20 blur-xl`}
//           ></div>
//           <div
//             className={`absolute -bottom-4 -left-4 w-32 h-32 rounded-full ${theme.particle} opacity-20 blur-xl`}
//           ></div>
//         </div>

//         {/* الأيقونة المركزية */}
//         <motion.div
//           initial={{ scale: 0.8, opacity: 0, rotate: -180 }}
//           animate={{ scale: 1, opacity: 1, rotate: 0 }}
//           transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 10 }}
//           className="flex items-center justify-center p-6 rounded-full bg-white/70 dark:bg-slate-800/60 shadow-lg backdrop-blur-sm relative z-10"
//         >
//           {animated ? (
//             <motion.div
//               animate={variant === "approved" ? { scale: [1, 1.1, 1] } : { rotate: [0, 5, -5, 0] }}
//               transition={{
//                 duration: 2,
//                 repeat: variant === "approved" ? 1 : Infinity,
//                 repeatType: "reverse",
//               }}
//             >
//               <Icon className={`h-12 w-12 ${theme.icon}`} aria-hidden="true" />
//             </motion.div>
//           ) : (
//             <Icon className={`h-12 w-12 ${theme.icon}`} aria-hidden="true" />
//           )}
//           {variant === "approved" && (
//             <motion.div
//               initial={{ scale: 0, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 15 }}
//               className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1"
//             >
//               <Sparkles className="h-4 w-4 text-white" />
//             </motion.div>
//           )}
//         </motion.div>

//         {/* العنوان الرئيسي */}
//         <motion.div
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.2, duration: 0.4 }}
//           className="text-center relative z-10"
//         >
//           <h2 className={`text-2xl sm:text-3xl font-bold ${theme.text} relative`}>
//             {variant === "pending"
//               ? "جاري مراجعة حسابك"
//               : variant === "approved"
//                 ? "تم تفعيل الحساب!"
//                 : "حالة الحساب"}
//             {variant === "approved" && (
//               <motion.div
//                 initial={{ scale: 0 }}
//                 animate={{ scale: 1 }}
//                 transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 15 }}
//                 className="absolute -top-2 -right-4"
//               >
//                 <Sparkles className="h-6 w-6 text-yellow-400" />
//               </motion.div>
//             )}
//           </h2>
//         </motion.div>

//         {/* الرسالة التفصيلية */}
//         <motion.p
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.3, duration: 0.4 }}
//           className={`text-center text-lg sm:text-xl leading-relaxed max-w-md ${theme.text} relative z-10`}
//         >
//           {currentMessage}
//         </motion.p>

//         {/* التوضيح الإضافي */}
//         {subtitle && (
//           <motion.p
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.4, duration: 0.4 }}
//             className={`text-center text-sm sm:text-base italic ${theme.text}/80 relative z-10`}
//           >
//             {subtitle}
//           </motion.p>
//         )}

//         {/* زر الإجراء عند الموافقة */}
//         {variant === "approved" && onAction && (
//           <motion.div
//             initial={{ opacity: 0, y: 20, scale: 0.9 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             transition={{ delay: 0.6, duration: 0.5, type: "spring", stiffness: 150, damping: 15 }}
//             className="mt-4 w-full max-w-xs relative z-10"
//           >
//             <Button
//               onClick={onAction}
//               className={`w-full py-4 text-lg font-semibold ${theme.button} text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2`}
//               size="lg"
//             >
//               {actionText}
//               <ArrowRight className="h-5 w-5" />
//             </Button>
//           </motion.div>
//         )}

//         {/* مؤشر التقدم في حالة الانتظار */}
//         {variant === "pending" && (
//           <motion.div
//             className="mt-6 w-full max-w-md relative z-10"
//             initial={{ scaleX: 0 }}
//             animate={{ scaleX: 1 }}
//             transition={{ duration: 1.5, ease: "easeOut" }}
//           >
//             <div className="flex h-2 overflow-hidden rounded-full bg-slate-200/50 dark:bg-slate-700/50 relative">
//               <motion.div
//                 className={`h-full bg-linear-to-r ${theme.accent} rounded-full`}
//                 initial={{ width: "0%" }}
//                 animate={{ width: "100%" }}
//                 transition={{
//                   duration: 3,
//                   repeat: Infinity,
//                   repeatType: "reverse",
//                   ease: "easeInOut",
//                 }}
//               />
//               <motion.div
//                 className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent"
//                 initial={{ x: "-100%" }}
//                 animate={{ x: "100%" }}
//                 transition={{
//                   duration: 2,
//                   repeat: Infinity,
//                   repeatDelay: 1,
//                   ease: "linear",
//                 }}
//               />
//             </div>
//           </motion.div>
//         )}

//         {/* زر التحديث (اختياري) */}
//         {showRefreshButton && onRefresh && (
//           <motion.div
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.7, duration: 0.4 }}
//             className="mt-4 relative z-10"
//           >
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={onRefresh}
//               className={`flex items-center gap-2 ${theme.border} ${theme.text} hover:bg-slate-100/50 dark:hover:bg-slate-700/50`}
//             >
//               <RotateCcw className={`h-4 w-4 ${isHovered ? "animate-spin" : ""}`} />
//               تحديث الحالة
//             </Button>
//           </motion.div>
//         )}

//         {/* تلميح في حالة الانتظار */}
//         {variant === "pending" && (
//           <motion.p
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.8, duration: 0.4 }}
//             className="mt-4 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 relative z-10 flex items-center justify-center gap-2"
//           >
//             <Clock className="h-4 w-4" />
//             لا تغلق هذه الصفحة — سيتم تحديث الحالة تلقائيًا.
//           </motion.p>
//         )}

//         {/* تلميح في حالة الرفض */}
//         {variant === "rejected" && (
//           <motion.p
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.8, duration: 0.4 }}
//             className="mt-4 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2 relative z-10"
//           >
//             <Mail className="h-4 w-4" />
//             يرجى التواصل مع الدعم عبر البريد: support@h-case-radar.com
//           </motion.p>
//         )}
//       </motion.div>
//     </div>
//   );
// }
