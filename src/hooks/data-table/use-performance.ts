import { useEffect, useRef } from "react";

export const usePerformance = (componentName: string) => {
  const mountTimeRef = useRef(performance.now());

  useEffect(() => {
    const mountTime = performance.now() - mountTimeRef.current;

    if (mountTime > 100) {
      console.warn(`🚀 ${componentName} mounted in ${mountTime.toFixed(2)}ms`);
    }

    return () => {
      const unmountTime = performance.now();
      // يمكن إرسال هذه البيانات لخدمة مراقبة الأداء
      console.log(
        `🚀 ${componentName} unmounted in ${(unmountTime - mountTime).toFixed(
          2,
        )}ms`,
      );
    };
  }, [componentName]);
};
