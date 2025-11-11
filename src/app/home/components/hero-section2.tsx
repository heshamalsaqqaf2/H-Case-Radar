// components/hero-prism-section.tsx

"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react"; // <-- تم تصحيح الخطأ هنا
import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

export default function HeroPrismSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  // استخدام MotionValue لتتبع حركة الماوس بشكل أكثر سلاسة
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // استخدام Spring لجعل الحركة أكثر نعومة وعضوية
  const smoothMouseX = useSpring(mouseX, { stiffness: 100, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 100, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // حساب الموضع بالنسبة لمركز الحاوية
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        mouseX.set(x);
        mouseY.set(y);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [mouseX, mouseY]);

  // تحويل إحداثيات الماوس إلى قيم دوران وانحراف للمستويات
  const rotateX = useTransform(smoothMouseY, [-300, 300], [15, -15]);
  const rotateY = useTransform(smoothMouseX, [-300, 300], [-15, 15]);

  return (
    // الحاوية الرئيسية مع خلفية متدرجة وملمس
    <section
      ref={containerRef}
      className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center"
    >
      {/* إضافة ملمض خلفية دقيق لإضافة عمق */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950"></div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 h-screen flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center w-full">
          {/* النصوص والأزرار على اليسار */}
          <motion.div
            className="text-center lg:text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.h1
              className="text-5xl md:text-7xl font-bold text-white leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              التصميم الذي
              <span className="block bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                يحرك الأفكار
              </span>
            </motion.h1>
            <motion.p
              className="mt-6 text-lg md:text-xl text-slate-400 max-w-lg mx-auto lg:mx-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              نحن لا نصمم واجهات، بل نصنع تجارب تفاعلية تترك أثرًا عميقًا. انحرف
              عن المألوف واكتشف عالمًا جديدًا من الإبداع.
            </motion.p>
            <motion.div
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Button
                size="lg"
                className="group rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
              >
                انطلق الآن
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-slate-700 text-white backdrop-blur-sm hover:bg-slate-800/50 transition-all duration-300"
              >
                <Zap className="ml-2 h-5 w-5" />
                شاهد السحر
              </Button>
            </motion.div>
          </motion.div>

          {/* العنصر التفاعلي المنحرف على اليمين */}
          <div className="relative h-[500px] w-full flex items-center justify-center lg:justify-end">
            <motion.div
              style={{
                rotateX: rotateX,
                rotateY: rotateY,
                transformStyle: "preserve-3d",
              }}
              className="relative w-80 h-80"
              whileHover={{ scale: 1.05 }} // <-- إضافة تأثير التكبير عند التمرير
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              {/* المستوى الأول - الخلفي */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-purple-600/30 to-pink-600/30 backdrop-blur-xl rounded-3xl border border-white/10"
                style={{
                  skewY: "-12deg",
                  transform: "translateZ(-50px) scale(1.1)",
                }}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 80,
                  damping: 15,
                  delay: 0.5,
                }}
              />
              {/* المستوى الثاني - الأوسط */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-tr from-cyan-600/30 to-blue-600/30 backdrop-blur-xl rounded-3xl border border-white/10"
                style={{
                  skewY: "6deg",
                  transform: "translateZ(0px) scale(0.95)",
                }}
                initial={{ scale: 0, rotate: 180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 80,
                  damping: 15,
                  delay: 0.6,
                }}
              />
              {/* المستوى الثالث - الأمامي */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-bl from-pink-600/30 to-purple-600/30 backdrop-blur-xl rounded-3xl border border-white/10 flex items-center justify-center"
                style={{
                  skewY: "-3deg",
                  transform: "translateZ(50px) scale(0.9)",
                }}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 80,
                  damping: 15,
                  delay: 0.7,
                }}
              >
                <span className="text-white/20 text-6xl font-bold select-none">
                  PRISM
                </span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
