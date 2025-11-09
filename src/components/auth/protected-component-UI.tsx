// /** biome-ignore-all lint/suspicious/noArrayIndexKey: <> */
// "use client";

// import { AnimatePresence, motion, useInView } from "framer-motion";
// import {
//   Activity,
//   AlertCircle,
//   AlertTriangle,
//   ArrowRight,
//   CheckCircle,
//   Crown,
//   Database,
//   Gem,
//   Home,
//   Key,
//   Lock,
//   LockOpen,
//   RefreshCcw,
//   RefreshCw,
//   Settings,
//   Shield,
//   ShieldCheck,
//   Sparkles,
//   UserCheck,
//   Users,
//   UserX,
//   X,
//   Zap,
// } from "lucide-react";
// import { useCallback, useEffect, useRef, useState } from "react";
// import {
//   useCurrentUser,
//   useUserPermissions,
// } from "@/lib/authorization/hooks/admin/use-auth";
// import { cn } from "@/lib/utils";
// import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
// import { Badge } from "../ui/badge";
// import { Button } from "../ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "../ui/card";

// interface ProtectedComponentProps {
//   children: React.ReactNode;
//   permission?: string;
//   fallback?: React.ReactNode;
//   className?: string;
// }

// // 3D Text component with advanced animations
// function Animated3DText({
//   text,
//   className,
//   delay = 0,
//   color = "text-indigo-600",
// }: {
//   text: string;
//   className?: string;
//   delay?: number;
//   color?: string;
// }) {
//   const ref = useRef(null);
//   const isInView = useInView(ref, { once: true, amount: 0.3 });

//   return (
//     <motion.div
//       ref={ref}
//       initial={{ opacity: 0, rotateY: -90, transformPerspective: 1000 }}
//       animate={isInView ? { opacity: 1, rotateY: 0 } : {}}
//       transition={{ duration: 0.8, delay, ease: "easeOut" }}
//       className={cn("relative", className)}
//       style={{ transformStyle: "preserve-3d" }}
//     >
//       <motion.h2
//         className={cn("font-bold", color)}
//         initial={{ textShadow: "0px 0px 0px rgba(0,0,0,0)" }}
//         animate={
//           isInView
//             ? {
//                 textShadow:
//                   "3px 3px 0px rgba(0,0,0,0.2), 6px 6px 0px rgba(0,0,0,0.1)",
//               }
//             : {}
//         }
//         transition={{ duration: 0.5, delay: delay + 0.3 }}
//       >
//         {text.split(" ").map((word, wordIndex) => (
//           <motion.span
//             key={wordIndex}
//             initial={{ opacity: 0, z: -50 }}
//             animate={isInView ? { opacity: 1, z: 0 } : {}}
//             transition={{
//               duration: 0.4,
//               delay: delay + wordIndex * 0.15,
//               ease: "easeOut",
//             }}
//             className="inline-block mx-1"
//             style={{ transformStyle: "preserve-3d" }}
//           >
//             {word}
//           </motion.span>
//         ))}
//       </motion.h2>
//     </motion.div>
//   );
// }

// // Subtitle component with 3D effect
// function Animated3DSubtitle({
//   text,
//   className,
//   delay = 0,
//   color = "text-slate-500",
// }: {
//   text: string;
//   className?: string;
//   delay?: number;
//   color?: string;
// }) {
//   const ref = useRef(null);
//   const isInView = useInView(ref, { once: true, amount: 0.3 });

//   return (
//     <motion.div
//       ref={ref}
//       initial={{ opacity: 0, rotateX: -45, transformPerspective: 1000 }}
//       animate={isInView ? { opacity: 1, rotateX: 0 } : {}}
//       transition={{ duration: 0.8, delay, ease: "easeOut" }}
//       className={cn("relative", className)}
//       style={{ transformStyle: "preserve-3d" }}
//     >
//       <motion.p
//         className={cn("text-sm", color)}
//         initial={{ textShadow: "0px 0px 0px rgba(0,0,0,0)" }}
//         animate={
//           isInView
//             ? {
//                 textShadow:
//                   "2px 2px 0px rgba(0,0,0,0.1), 4px 4px 0px rgba(0,0,0,0.05)",
//               }
//             : {}
//         }
//         transition={{ duration: 0.5, delay: delay + 0.3 }}
//       >
//         {text.split(" ").map((word, wordIndex) => (
//           <motion.span
//             key={wordIndex}
//             initial={{ opacity: 0, z: -30 }}
//             animate={isInView ? { opacity: 1, z: 0 } : {}}
//             transition={{
//               duration: 0.4,
//               delay: delay + wordIndex * 0.1,
//               ease: "easeOut",
//             }}
//             className="inline-block mx-1"
//             style={{ transformStyle: "preserve-3d" }}
//           >
//             {word}
//           </motion.span>
//         ))}
//       </motion.p>
//     </motion.div>
//   );
// }

// // Floating text component for additional visual interest
// function FloatingText({
//   text,
//   className,
//   delay = 0,
//   color = "text-indigo-600",
// }: {
//   text: string;
//   className?: string;
//   delay?: number;
//   color?: string;
// }) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.6, delay }}
//       className={cn("absolute", className)}
//     >
//       <motion.p
//         className={cn("text-xs font-medium", color)}
//         animate={{
//           y: [0, -5, 0],
//         }}
//         transition={{
//           duration: 3,
//           repeat: Infinity,
//           ease: "easeInOut",
//           delay: delay + 1,
//         }}
//       >
//         {text}
//       </motion.p>
//     </motion.div>
//   );
// }

// // Dashboard-style card component
// function DashboardCard({
//   title,
//   value,
//   icon: Icon,
//   color = "blue",
//   delay = 0,
// }: {
//   title: string;
//   value: string | number;
//   icon: any;
//   color?: string;
//   delay?: number;
// }) {
//   const colorClasses = {
//     blue: "from-blue-500 to-blue-600",
//     purple: "from-purple-500 to-purple-600",
//     green: "from-green-500 to-green-600",
//     amber: "from-amber-500 to-amber-600",
//     red: "from-red-500 to-red-600",
//     cyan: "from-cyan-500 to-cyan-600",
//   };

//   const bgClasses = {
//     blue: "bg-blue-100 text-blue-600",
//     purple: "bg-purple-100 text-purple-600",
//     green: "bg-green-100 text-green-600",
//     amber: "bg-amber-100 text-amber-600",
//     red: "bg-red-100 text-red-600",
//     cyan: "bg-cyan-100 text-cyan-600",
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5, delay }}
//       className="bg-white rounded-lg shadow-md p-4 border border-slate-200"
//     >
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-sm font-medium text-slate-600">{title}</p>
//           <p className="text-2xl font-bold text-slate-800">{value}</p>
//         </div>
//         <div
//           className={cn(
//             "p-3 rounded-full",
//             bgClasses[color as keyof typeof bgClasses],
//           )}
//         >
//           <Icon className="h-6 w-6" />
//         </div>
//       </div>
//     </motion.div>
//   );
// }

// // Quick action button component
// function QuickActionButton({
//   title,
//   description,
//   icon: Icon,
//   color = "blue",
//   delay = 0,
// }: {
//   title: string;
//   description: string;
//   icon: any;
//   color?: string;
//   delay?: number;
// }) {
//   const colorClasses = {
//     blue: "bg-blue-500 hover:bg-blue-600",
//     purple: "bg-purple-500 hover:bg-purple-600",
//     green: "bg-green-500 hover:bg-green-600",
//     amber: "bg-amber-500 hover:bg-amber-600",
//     red: "bg-red-500 hover:bg-red-600",
//     cyan: "bg-cyan-500 hover:bg-cyan-600",
//   };

//   return (
//     <motion.button
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5, delay }}
//       className={cn(
//         "w-full p-4 rounded-lg shadow-md text-white flex items-center space-x-3 space-x-reverse transition-colors",
//         colorClasses[color as keyof typeof colorClasses],
//       )}
//     >
//       <Icon className="h-5 w-5" />
//       <div className="text-right">
//         <p className="font-medium">{title}</p>
//         <p className="text-xs opacity-90">{description}</p>
//       </div>
//       <ArrowRight className="h-4 w-4 mr-auto" />
//     </motion.button>
//   );
// }

// export function ProtectedComponent({
//   children,
//   permission,
//   fallback,
//   className,
// }: ProtectedComponentProps) {
//   const {
//     data: user,
//     isLoading: userLoading,
//     error: userError,
//     status: userStatus,
//   } = useCurrentUser();

//   const {
//     data: userPermissions,
//     isLoading: permissionsLoading,
//     status: permissionsStatus,
//   } = useUserPermissions(user?.id);

//   const [hasAccess, setHasAccess] = useState<boolean | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [mounted, setMounted] = useState(false);
//   const [initialized, setInitialized] = useState(false);
//   const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
//   const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);

//   // Clear timeout on unmount
//   useEffect(() => {
//     return () => {
//       if (successTimeoutRef.current) {
//         clearTimeout(successTimeoutRef.current);
//       }
//     };
//   }, []);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   // Function to show success animation with proper cleanup
//   const triggerSuccessAnimation = useCallback(() => {
//     // Clear any existing timeout
//     if (successTimeoutRef.current) {
//       clearTimeout(successTimeoutRef.current);
//     }

//     setShowSuccessAnimation(true);

//     // Set new timeout with cleanup
//     successTimeoutRef.current = setTimeout(() => {
//       setShowSuccessAnimation(false);
//       successTimeoutRef.current = null;
//     }, 1500);
//   }, []);

//   // Check access permissions with proper state management
//   useEffect(() => {
//     // Skip if not mounted or user is still loading
//     if (!mounted || userLoading) return;

//     // If there's no user, set access to false
//     if (!user) {
//       setHasAccess(false);
//       setLoading(false);
//       setInitialized(true);
//       return;
//     }

//     // Wait for permissions to load if user exists
//     if (permissionsLoading) return;

//     try {
//       let access = false;

//       if (permission) {
//         access =
//           userPermissions?.some((perm) => perm.name === permission) || false;
//       } else {
//         access = true;
//       }

//       setHasAccess(access);

//       // Only show success animation once when access is granted
//       if (access && initialized) {
//         triggerSuccessAnimation();
//       }
//     } catch (error) {
//       console.error("Error checking access:", error);
//       setHasAccess(false);
//     } finally {
//       setLoading(false);
//       setInitialized(true);
//     }
//   }, [
//     user,
//     userPermissions,
//     permission,
//     userLoading,
//     permissionsLoading,
//     mounted,
//     initialized,
//     triggerSuccessAnimation,
//   ]);

//   const isLoading = userLoading || permissionsLoading || loading;

//   if (!mounted) return null;

//   if (isLoading) {
//     return (
//       <div
//         className={cn(
//           "fixed inset-0 flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 z-50",
//           className,
//         )}
//       >
//         {/* Animated SVG Background */}
//         <div className="absolute inset-0 overflow-hidden">
//           <svg
//             className="absolute w-full h-full"
//             xmlns="http://www.w3.org/2000/svg"
//           >
//             <title>Loading Background</title>
//             <defs>
//               <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
//                 <stop offset="0%" stopColor="#6366f1" stopOpacity="0.05" />
//                 <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.05" />
//               </linearGradient>
//               <filter id="glow">
//                 <feGaussianBlur stdDeviation="3" result="coloredBlur" />
//                 <feMerge>
//                   <feMergeNode in="coloredBlur" />
//                   <feMergeNode in="SourceGraphic" />
//                 </feMerge>
//               </filter>
//             </defs>
//             <motion.rect
//               x="10%"
//               y="20%"
//               width="80"
//               height="80"
//               rx="20"
//               fill="url(#grad1)"
//               animate={{
//                 rotate: [0, 360],
//                 scale: [1, 1.2, 1],
//               }}
//               transition={{
//                 duration: 20,
//                 repeat: Infinity,
//                 ease: "linear",
//               }}
//             />
//             <motion.circle
//               cx="80%"
//               cy="30%"
//               r="60"
//               fill="url(#grad1)"
//               animate={{
//                 scale: [1, 1.3, 1],
//               }}
//               transition={{
//                 duration: 15,
//                 repeat: Infinity,
//                 ease: "easeInOut",
//               }}
//             />
//             <motion.polygon
//               points="50,10 90,90 10,90"
//               fill="url(#grad1)"
//               animate={{
//                 rotate: [0, 360],
//               }}
//               transition={{
//                 duration: 25,
//                 repeat: Infinity,
//                 ease: "linear",
//               }}
//             />
//           </svg>

//           {/* Floating particles */}
//           {[...Array(20)].map((_, i) => (
//             <motion.div
//               key={`particle-${i}`}
//               className="absolute rounded-full bg-indigo-200/20"
//               style={{
//                 width: `${Math.random() * 6 + 2}px`,
//                 height: `${Math.random() * 6 + 2}px`,
//                 left: `${Math.random() * 100}%`,
//                 top: `${Math.random() * 100}%`,
//               }}
//               animate={{
//                 y: [0, -30, 0],
//                 opacity: [0.1, 0.3, 0.1],
//               }}
//               transition={{
//                 duration: 5 + Math.random() * 10,
//                 repeat: Infinity,
//                 delay: Math.random() * 5,
//               }}
//             />
//           ))}
//         </div>

//         <div className="relative z-10 flex w-full max-w-6xl mx-auto">
//           {/* Left side - SVG Illustration with 3D text */}
//           <div className="hidden lg:flex lg:w-1/2 items-center justify-center">
//             <div className="relative">
//               <motion.div
//                 initial={{ opacity: 0, x: -50 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ duration: 0.8 }}
//                 className="relative"
//               >
//                 <svg
//                   width="400"
//                   height="400"
//                   viewBox="0 0 400 400"
//                   className="w-full h-auto max-w-md drop-shadow-lg"
//                 >
//                   <title>Loading Shield</title>
//                   <defs>
//                     <linearGradient
//                       id="shield-gradient"
//                       x1="0%"
//                       y1="0%"
//                       x2="100%"
//                       y2="100%"
//                     >
//                       <stop offset="0%" stopColor="#6366f1" />
//                       <stop offset="100%" stopColor="#8b5cf6" />
//                     </linearGradient>
//                     <linearGradient
//                       id="lock-gradient"
//                       x1="0%"
//                       y1="0%"
//                       x2="100%"
//                       y2="100%"
//                     >
//                       <stop offset="0%" stopColor="#4f46e5" />
//                       <stop offset="100%" stopColor="#7c3aed" />
//                     </linearGradient>
//                     <filter id="glow">
//                       <feGaussianBlur stdDeviation="3" result="coloredBlur" />
//                       <feMerge>
//                         <feMergeNode in="coloredBlur" />
//                         <feMergeNode in="SourceGraphic" />
//                       </feMerge>
//                     </filter>
//                   </defs>

//                   {/* Shield */}
//                   <motion.path
//                     d="M200,50 L300,100 L300,200 C300,280 200,350 200,350 C200,350 100,280 100,200 L100,100 Z"
//                     fill="url(#shield-gradient)"
//                     fillOpacity="0.15"
//                     stroke="url(#shield-gradient)"
//                     strokeWidth="3"
//                     filter="url(#glow)"
//                     animate={{
//                       pathLength: [0, 1],
//                     }}
//                     transition={{ duration: 2, ease: "easeInOut" }}
//                   />

//                   {/* Lock */}
//                   <motion.g
//                     animate={{
//                       scale: [0.9, 1.1, 0.9],
//                     }}
//                     transition={{
//                       duration: 3,
//                       repeat: Infinity,
//                       ease: "easeInOut",
//                     }}
//                   >
//                     <rect
//                       x="170"
//                       y="180"
//                       width="60"
//                       height="40"
//                       rx="5"
//                       fill="url(#lock-gradient)"
//                       filter="url(#glow)"
//                     />
//                     <path
//                       d="M180,180 L180,170 C180,160 190,150 200,150 C210,150 220,160 220,170 L220,180"
//                       stroke="url(#lock-gradient)"
//                       strokeWidth="3"
//                       fill="none"
//                     />
//                     <circle cx="200" cy="200" r="5" fill="white" />
//                   </motion.g>

//                   {/* Floating elements */}
//                   <motion.circle
//                     cx="150"
//                     cy="120"
//                     r="6"
//                     fill="#6366f1"
//                     filter="url(#glow)"
//                     animate={{
//                       cx: [150, 160, 150],
//                       cy: [120, 110, 120],
//                       opacity: [0.4, 0.8, 0.4],
//                     }}
//                     transition={{
//                       duration: 4,
//                       repeat: Infinity,
//                       ease: "easeInOut",
//                     }}
//                   />
//                   <motion.circle
//                     cx="250"
//                     cy="130"
//                     r="5"
//                     fill="#8b5cf6"
//                     filter="url(#glow)"
//                     animate={{
//                       cx: [250, 240, 250],
//                       cy: [130, 140, 130],
//                       opacity: [0.4, 0.8, 0.4],
//                     }}
//                     transition={{
//                       duration: 3.5,
//                       repeat: Infinity,
//                       ease: "easeInOut",
//                       delay: 1,
//                     }}
//                   />
//                   <motion.circle
//                     cx="180"
//                     cy="280"
//                     r="7"
//                     fill="#6366f1"
//                     filter="url(#glow)"
//                     animate={{
//                       cx: [180, 190, 180],
//                       cy: [280, 270, 280],
//                       opacity: [0.4, 0.8, 0.4],
//                     }}
//                     transition={{
//                       duration: 4.5,
//                       repeat: Infinity,
//                       ease: "easeInOut",
//                       delay: 0.5,
//                     }}
//                   />
//                   <motion.circle
//                     cx="220"
//                     cy="290"
//                     r="6"
//                     fill="#8b5cf6"
//                     filter="url(#glow)"
//                     animate={{
//                       cx: [220, 210, 220],
//                       cy: [290, 300, 290],
//                       opacity: [0.4, 0.8, 0.4],
//                     }}
//                     transition={{
//                       duration: 3,
//                       repeat: Infinity,
//                       ease: "easeInOut",
//                       delay: 1.5,
//                     }}
//                   />
//                 </svg>
//               </motion.div>

//               {/* 3D Text positioned at different locations */}
//               <Animated3DText
//                 text="Securing Your Access"
//                 className="absolute top-0 left-0 right-0 text-center text-xl"
//                 delay={0.5}
//                 color="text-indigo-600"
//               />

//               <Animated3DSubtitle
//                 text="Verifying permissions"
//                 className="absolute top-12 left-0 right-0 text-center"
//                 delay={0.8}
//                 color="text-slate-500"
//               />

//               <FloatingText
//                 text="Checking authentication"
//                 className="bottom-20 left-10"
//                 delay={1.2}
//                 color="text-indigo-500"
//               />

//               <FloatingText
//                 text="Loading resources"
//                 className="bottom-20 right-10"
//                 delay={1.5}
//                 color="text-purple-500"
//               />
//             </div>
//           </div>

//           {/* Right side - Dashboard-style content */}
//           <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: 0.2 }}
//               className="w-full max-w-md"
//             >
//               <div className="bg-white/95 backdrop-blur-xl rounded-lg shadow-xl overflow-hidden border border-slate-200">
//                 <div className="p-6 border-b border-slate-200">
//                   <div className="flex items-center space-x-3 space-x-reverse">
//                     <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 p-0.5">
//                       <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
//                         <Shield className="h-6 w-6 text-indigo-600" />
//                       </div>
//                     </div>
//                     <div>
//                       <h3 className="text-xl font-bold text-slate-800">
//                         Admin Dashboard
//                       </h3>
//                       <p className="text-slate-600">
//                         Welcome to your admin dashboard
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="p-6 space-y-4">
//                   <div className="grid grid-cols-2 gap-4">
//                     <DashboardCard
//                       title="Total Users"
//                       value="2"
//                       icon={Users}
//                       color="blue"
//                       delay={0.3}
//                     />
//                     <DashboardCard
//                       title="Roles"
//                       value="4"
//                       icon={ShieldCheck}
//                       color="purple"
//                       delay={0.4}
//                     />
//                     <DashboardCard
//                       title="Permissions"
//                       value="24"
//                       icon={Key}
//                       color="green"
//                       delay={0.5}
//                     />
//                     <DashboardCard
//                       title="System Status"
//                       value="Active"
//                       icon={Activity}
//                       color="amber"
//                       delay={0.6}
//                     />
//                   </div>

//                   <div className="pt-4 border-t border-slate-200">
//                     <h4 className="font-medium text-slate-700 mb-3">
//                       Quick Actions
//                     </h4>
//                     <div className="space-y-2">
//                       <QuickActionButton
//                         title="Add User"
//                         description="Create new user account"
//                         icon={UserCheck}
//                         color="blue"
//                         delay={0.7}
//                       />
//                       <QuickActionButton
//                         title="Create Role"
//                         description="Define new role with permissions"
//                         icon={Crown}
//                         color="purple"
//                         delay={0.8}
//                       />
//                       <QuickActionButton
//                         title="Manage Permissions"
//                         description="Configure system permissions"
//                         icon={Settings}
//                         color="green"
//                         delay={0.9}
//                       />
//                     </div>
//                   </div>

//                   <div className="flex items-center justify-between pt-4 border-t border-slate-200">
//                     <div className="flex items-center space-x-2 space-x-reverse">
//                       <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//                       <span className="text-sm text-slate-600">
//                         System Status: Active
//                       </span>
//                     </div>
//                     <Badge
//                       variant="outline"
//                       className="bg-slate-100 text-slate-700 border-slate-200"
//                     >
//                       {userStatus}
//                     </Badge>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (userError) {
//     return (
//       <div
//         className={cn(
//           "fixed inset-0 flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 z-50",
//           className,
//         )}
//       >
//         {/* Animated SVG Background */}
//         <div className="absolute inset-0 overflow-hidden">
//           <svg
//             className="absolute w-full h-full"
//             xmlns="http://www.w3.org/2000/svg"
//           >
//             <title>Error Background</title>
//             <defs>
//               <linearGradient
//                 id="error-grad"
//                 x1="0%"
//                 y1="0%"
//                 x2="100%"
//                 y2="100%"
//               >
//                 <stop offset="0%" stopColor="#ef4444" stopOpacity="0.05" />
//                 <stop offset="100%" stopColor="#f97316" stopOpacity="0.05" />
//               </linearGradient>
//               <filter id="error-glow">
//                 <feGaussianBlur stdDeviation="3" result="coloredBlur" />
//                 <feMerge>
//                   <feMergeNode in="coloredBlur" />
//                   <feMergeNode in="SourceGraphic" />
//                 </feMerge>
//               </filter>
//             </defs>
//             <motion.rect
//               x="10%"
//               y="20%"
//               width="80"
//               height="80"
//               rx="20"
//               fill="url(#error-grad)"
//               animate={{
//                 rotate: [0, 360],
//                 scale: [1, 1.2, 1],
//               }}
//               transition={{
//                 duration: 20,
//                 repeat: Infinity,
//                 ease: "linear",
//               }}
//             />
//             <motion.circle
//               cx="80%"
//               cy="30%"
//               r="60"
//               fill="url(#error-grad)"
//               animate={{
//                 scale: [1, 1.3, 1],
//               }}
//               transition={{
//                 duration: 15,
//                 repeat: Infinity,
//                 ease: "easeInOut",
//               }}
//             />
//           </svg>
//         </div>

//         <div className="relative z-10 flex w-full max-w-6xl mx-auto">
//           {/* Left side - SVG Illustration with 3D text */}
//           <div className="hidden lg:flex lg:w-1/2 items-center justify-center">
//             <div className="relative">
//               <motion.div
//                 initial={{ opacity: 0, x: -50 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ duration: 0.8 }}
//                 className="relative"
//               >
//                 <svg
//                   width="400"
//                   height="400"
//                   viewBox="0 0 400 400"
//                   className="w-full h-auto max-w-md drop-shadow-lg"
//                 >
//                   <title>Error Shield</title>
//                   <defs>
//                     <linearGradient
//                       id="error-shield-gradient"
//                       x1="0%"
//                       y1="0%"
//                       x2="100%"
//                       y2="100%"
//                     >
//                       <stop offset="0%" stopColor="#ef4444" />
//                       <stop offset="100%" stopColor="#f97316" />
//                     </linearGradient>
//                     <filter id="error-glow">
//                       <feGaussianBlur stdDeviation="3" result="coloredBlur" />
//                       <feMerge>
//                         <feMergeNode in="coloredBlur" />
//                         <feMergeNode in="SourceGraphic" />
//                       </feMerge>
//                     </filter>
//                   </defs>

//                   {/* Shield with crack */}
//                   <motion.path
//                     d="M200,50 L300,100 L300,200 C300,280 200,350 200,350 C200,350 100,280 100,200 L100,100 Z"
//                     fill="url(#error-shield-gradient)"
//                     fillOpacity="0.15"
//                     stroke="url(#error-shield-gradient)"
//                     strokeWidth="3"
//                     filter="url(#error-glow)"
//                     animate={{
//                       pathLength: [0, 1],
//                     }}
//                     transition={{ duration: 2, ease: "easeInOut" }}
//                   />

//                   {/* Crack */}
//                   <motion.path
//                     d="M200,150 L210,180 L190,210 L205,240"
//                     stroke="#ef4444"
//                     strokeWidth="4"
//                     fill="none"
//                     filter="url(#error-glow)"
//                     animate={{
//                       pathLength: [0, 1],
//                     }}
//                     transition={{
//                       duration: 1.5,
//                       delay: 0.5,
//                       ease: "easeInOut",
//                     }}
//                   />

//                   {/* Alert icon */}
//                   <motion.g
//                     animate={{
//                       scale: [0.9, 1.1, 0.9],
//                     }}
//                     transition={{
//                       duration: 3,
//                       repeat: Infinity,
//                       ease: "easeInOut",
//                     }}
//                   >
//                     <circle
//                       cx="200"
//                       cy="200"
//                       r="35"
//                       fill="url(#error-shield-gradient)"
//                       fillOpacity="0.2"
//                       filter="url(#error-glow)"
//                     />
//                     <path
//                       d="M200,180 L200,210"
//                       stroke="#ef4444"
//                       strokeWidth="5"
//                       strokeLinecap="round"
//                     />
//                     <circle cx="200" cy="225" r="4" fill="#ef4444" />
//                   </motion.g>

//                   {/* Floating elements */}
//                   <motion.circle
//                     cx="150"
//                     cy="120"
//                     r="6"
//                     fill="#ef4444"
//                     filter="url(#error-glow)"
//                     animate={{
//                       cx: [150, 160, 150],
//                       cy: [120, 110, 120],
//                       opacity: [0.4, 0.8, 0.4],
//                     }}
//                     transition={{
//                       duration: 4,
//                       repeat: Infinity,
//                       ease: "easeInOut",
//                     }}
//                   />
//                   <motion.circle
//                     cx="250"
//                     cy="130"
//                     r="5"
//                     fill="#f97316"
//                     filter="url(#error-glow)"
//                     animate={{
//                       cx: [250, 240, 250],
//                       cy: [130, 140, 130],
//                       opacity: [0.4, 0.8, 0.4],
//                     }}
//                     transition={{
//                       duration: 3.5,
//                       repeat: Infinity,
//                       ease: "easeInOut",
//                       delay: 1,
//                     }}
//                   />
//                 </svg>
//               </motion.div>

//               {/* 3D Text positioned at different locations */}
//               <Animated3DText
//                 text="Authentication Failed"
//                 className="absolute top-0 left-0 right-0 text-center text-xl"
//                 delay={0.5}
//                 color="text-red-600"
//               />

//               <Animated3DSubtitle
//                 text="Please check your connection"
//                 className="absolute top-12 left-0 right-0 text-center"
//                 delay={0.8}
//                 color="text-slate-500"
//               />

//               <FloatingText
//                 text="Error occurred"
//                 className="bottom-20 left-10"
//                 delay={1.2}
//                 color="text-red-500"
//               />

//               <FloatingText
//                 text="Try again later"
//                 className="bottom-20 right-10"
//                 delay={1.5}
//                 color="text-orange-500"
//               />
//             </div>
//           </div>

//           {/* Right side - Dashboard-style content */}
//           <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: 0.2 }}
//               className="w-full max-w-md"
//             >
//               <div className="bg-white/95 backdrop-blur-xl rounded-lg shadow-xl overflow-hidden border border-slate-200">
//                 <div className="p-6 border-b border-slate-200">
//                   <div className="flex items-center space-x-3 space-x-reverse">
//                     <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-orange-600 p-0.5">
//                       <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
//                         <AlertCircle className="h-6 w-6 text-red-500" />
//                       </div>
//                     </div>
//                     <div>
//                       <h3 className="text-xl font-bold text-slate-800">
//                         Authentication Error
//                       </h3>
//                       <p className="text-slate-600">{userError.message}</p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="p-6 space-y-4">
//                   <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//                     <div className="flex items-start space-x-3 space-x-reverse">
//                       <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
//                       <div>
//                         <h4 className="font-medium text-red-800">
//                           Error Details
//                         </h4>
//                         <p className="text-sm text-red-600 mt-1">
//                           There was a problem authenticating your request.
//                           Please try again or contact support if the problem
//                           persists.
//                         </p>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-2 gap-4">
//                     <DashboardCard
//                       title="Error Code"
//                       value="500"
//                       icon={AlertCircle}
//                       color="red"
//                       delay={0.3}
//                     />
//                     <DashboardCard
//                       title="Status"
//                       value="Failed"
//                       icon={X}
//                       color="amber"
//                       delay={0.4}
//                     />
//                   </div>

//                   <Button
//                     onClick={() => window.location.reload()}
//                     className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium"
//                   >
//                     <RefreshCw className="ml-2 h-4 w-4" />
//                     Retry
//                   </Button>
//                 </div>
//               </div>
//             </motion.div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!user) {
//     return (
//       <div
//         className={cn(
//           "fixed inset-0 flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 z-50",
//           className,
//         )}
//       >
//         {/* Animated SVG Background */}
//         <div className="absolute inset-0 overflow-hidden">
//           <svg
//             className="absolute w-full h-full"
//             xmlns="http://www.w3.org/2000/svg"
//           >
//             <title>Login Background</title>
//             <defs>
//               <linearGradient
//                 id="login-grad"
//                 x1="0%"
//                 y1="0%"
//                 x2="100%"
//                 y2="100%"
//               >
//                 <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.05" />
//                 <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
//               </linearGradient>
//               <filter id="login-glow">
//                 <feGaussianBlur stdDeviation="3" result="coloredBlur" />
//                 <feMerge>
//                   <feMergeNode in="coloredBlur" />
//                   <feMergeNode in="SourceGraphic" />
//                 </feMerge>
//               </filter>
//             </defs>
//             <motion.rect
//               x="10%"
//               y="20%"
//               width="80"
//               height="80"
//               rx="20"
//               fill="url(#login-grad)"
//               animate={{
//                 rotate: [0, 360],
//                 scale: [1, 1.2, 1],
//               }}
//               transition={{
//                 duration: 20,
//                 repeat: Infinity,
//                 ease: "linear",
//               }}
//             />
//             <motion.circle
//               cx="80%"
//               cy="30%"
//               r="60"
//               fill="url(#login-grad)"
//               animate={{
//                 scale: [1, 1.3, 1],
//               }}
//               transition={{
//                 duration: 15,
//                 repeat: Infinity,
//                 ease: "easeInOut",
//               }}
//             />
//           </svg>
//         </div>

//         <div className="relative z-10 flex w-full max-w-6xl mx-auto">
//           {/* Left side - SVG Illustration with 3D text */}
//           <div className="hidden lg:flex lg:w-1/2 items-center justify-center">
//             <div className="relative">
//               <motion.div
//                 initial={{ opacity: 0, x: -50 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ duration: 0.8 }}
//                 className="relative"
//               >
//                 <svg
//                   width="400"
//                   height="400"
//                   viewBox="0 0 400 400"
//                   className="w-full h-auto max-w-md drop-shadow-lg"
//                 >
//                   <title>Login User</title>
//                   <defs>
//                     <linearGradient
//                       id="login-gradient"
//                       x1="0%"
//                       y1="0%"
//                       x2="100%"
//                       y2="100%"
//                     >
//                       <stop offset="0%" stopColor="#06b6d4" />
//                       <stop offset="100%" stopColor="#3b82f6" />
//                     </linearGradient>
//                     <filter id="login-glow">
//                       <feGaussianBlur stdDeviation="3" result="coloredBlur" />
//                       <feMerge>
//                         <feMergeNode in="coloredBlur" />
//                         <feMergeNode in="SourceGraphic" />
//                       </feMerge>
//                     </filter>
//                   </defs>

//                   {/* User silhouette */}
//                   <motion.path
//                     d="M200,120 C230,120 250,140 250,170 C250,200 230,220 200,220 C170,220 150,200 150,170 C150,140 170,120 200,120 Z"
//                     fill="url(#login-gradient)"
//                     fillOpacity="0.15"
//                     stroke="url(#login-gradient)"
//                     strokeWidth="3"
//                     filter="url(#login-glow)"
//                     animate={{
//                       pathLength: [0, 1],
//                     }}
//                     transition={{ duration: 2, ease: "easeInOut" }}
//                   />

//                   <motion.path
//                     d="M120,280 C120,230 150,200 200,200 C250,200 280,230 280,280"
//                     fill="url(#login-gradient)"
//                     fillOpacity="0.15"
//                     stroke="url(#login-gradient)"
//                     strokeWidth="3"
//                     filter="url(#login-glow)"
//                     animate={{
//                       pathLength: [0, 1],
//                     }}
//                     transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
//                   />

//                   {/* Lock icon */}
//                   <motion.g
//                     animate={{
//                       scale: [0.9, 1.1, 0.9],
//                     }}
//                     transition={{
//                       duration: 3,
//                       repeat: Infinity,
//                       ease: "easeInOut",
//                     }}
//                   >
//                     <rect
//                       x="170"
//                       y="250"
//                       width="60"
//                       height="40"
//                       rx="5"
//                       fill="url(#login-gradient)"
//                       fillOpacity="0.2"
//                       filter="url(#login-glow)"
//                     />
//                     <path
//                       d="M180,250 L180,240 C180,230 190,220 200,220 C210,220 220,230 220,240 L220,250"
//                       stroke="url(#login-gradient)"
//                       strokeWidth="3"
//                       fill="none"
//                     />
//                     <circle
//                       cx="200"
//                       cy="270"
//                       r="5"
//                       fill="url(#login-gradient)"
//                     />
//                   </motion.g>

//                   {/* Floating elements */}
//                   <motion.circle
//                     cx="150"
//                     cy="120"
//                     r="6"
//                     fill="#06b6d4"
//                     filter="url(#login-glow)"
//                     animate={{
//                       cx: [150, 160, 150],
//                       cy: [120, 110, 120],
//                       opacity: [0.4, 0.8, 0.4],
//                     }}
//                     transition={{
//                       duration: 4,
//                       repeat: Infinity,
//                       ease: "easeInOut",
//                     }}
//                   />
//                   <motion.circle
//                     cx="250"
//                     cy="130"
//                     r="5"
//                     fill="#3b82f6"
//                     filter="url(#login-glow)"
//                     animate={{
//                       cx: [250, 240, 250],
//                       cy: [130, 140, 130],
//                       opacity: [0.4, 0.8, 0.4],
//                     }}
//                     transition={{
//                       duration: 3.5,
//                       repeat: Infinity,
//                       ease: "easeInOut",
//                       delay: 1,
//                     }}
//                   />
//                 </svg>
//               </motion.div>

//               {/* 3D Text positioned at different locations */}
//               <Animated3DText
//                 text="Authentication Required"
//                 className="absolute top-0 left-0 right-0 text-center text-xl"
//                 delay={0.5}
//                 color="text-cyan-600"
//               />

//               <Animated3DSubtitle
//                 text="Please sign in to continue"
//                 className="absolute top-12 left-0 right-0 text-center"
//                 delay={0.8}
//                 color="text-slate-500"
//               />

//               <FloatingText
//                 text="No user session"
//                 className="bottom-20 left-10"
//                 delay={1.2}
//                 color="text-cyan-500"
//               />

//               <FloatingText
//                 text="Login needed"
//                 className="bottom-20 right-10"
//                 delay={1.5}
//                 color="text-blue-500"
//               />
//             </div>
//           </div>

//           {/* Right side - Dashboard-style content */}
//           <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: 0.2 }}
//               className="w-full max-w-md"
//             >
//               <div className="bg-white/95 backdrop-blur-xl rounded-lg shadow-xl overflow-hidden border border-slate-200">
//                 <div className="p-6 border-b border-slate-200">
//                   <div className="flex items-center space-x-3 space-x-reverse">
//                     <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 p-0.5">
//                       <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
//                         <UserX className="h-6 w-6 text-cyan-600" />
//                       </div>
//                     </div>
//                     <div>
//                       <h3 className="text-xl font-bold text-slate-800">
//                         Authentication Required
//                       </h3>
//                       <p className="text-slate-600">
//                         Please log in to access this page.
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="p-6 space-y-4">
//                   <Alert className="bg-blue-50 border-blue-200">
//                     <AlertCircle className="h-4 w-4 text-blue-600" />
//                     <AlertTitle className="text-blue-800">
//                       Possible issues:
//                     </AlertTitle>
//                     <AlertDescription className="text-blue-700 text-sm">
//                       <ul className="list-disc list-inside mt-2 space-y-1">
//                         <li>Authentication session not working</li>
//                         <li>Cookies not being sent properly</li>
//                         <li>API route configuration issue</li>
//                       </ul>
//                     </AlertDescription>
//                   </Alert>

//                   <div className="grid grid-cols-2 gap-4">
//                     <DashboardCard
//                       title="User Status"
//                       value="Logged Out"
//                       icon={UserX}
//                       color="red"
//                       delay={0.3}
//                     />
//                     <DashboardCard
//                       title="Access Level"
//                       value="None"
//                       icon={Lock}
//                       color="amber"
//                       delay={0.4}
//                     />
//                   </div>

//                   <Button
//                     asChild
//                     className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium"
//                   >
//                     <a href="/">
//                       <Home className="ml-2 h-4 w-4" />
//                       Go to Home Page
//                     </a>
//                   </Button>
//                 </div>
//               </div>
//             </motion.div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!hasAccess) {
//     return (
//       fallback || (
//         <div
//           className={cn(
//             "fixed inset-0 flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 z-50",
//             className,
//           )}
//         >
//           {/* Animated SVG Background */}
//           <div className="absolute inset-0 overflow-hidden">
//             <svg
//               className="absolute w-full h-full"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <title>Access Denied Background</title>
//               <defs>
//                 <linearGradient
//                   id="access-grad"
//                   x1="0%"
//                   y1="0%"
//                   x2="100%"
//                   y2="100%"
//                 >
//                   <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.05" />
//                   <stop offset="100%" stopColor="#eab308" stopOpacity="0.05" />
//                 </linearGradient>
//                 <filter id="access-glow">
//                   <feGaussianBlur stdDeviation="3" result="coloredBlur" />
//                   <feMerge>
//                     <feMergeNode in="coloredBlur" />
//                     <feMergeNode in="SourceGraphic" />
//                   </feMerge>
//                 </filter>
//               </defs>
//               <motion.rect
//                 x="10%"
//                 y="20%"
//                 width="80"
//                 height="80"
//                 rx="20"
//                 fill="url(#access-grad)"
//                 animate={{
//                   rotate: [0, 360],
//                   scale: [1, 1.2, 1],
//                 }}
//                 transition={{
//                   duration: 20,
//                   repeat: Infinity,
//                   ease: "linear",
//                 }}
//               />
//               <motion.circle
//                 cx="80%"
//                 cy="30%"
//                 r="60"
//                 fill="url(#access-grad)"
//                 animate={{
//                   scale: [1, 1.3, 1],
//                 }}
//                 transition={{
//                   duration: 15,
//                   repeat: Infinity,
//                   ease: "easeInOut",
//                 }}
//               />
//             </svg>
//           </div>

//           <div className="relative z-10 flex w-full max-w-6xl mx-auto">
//             {/* Left side - SVG Illustration with 3D text */}
//             <div className="hidden lg:flex lg:w-1/2 items-center justify-center">
//               <div className="relative">
//                 <motion.div
//                   initial={{ opacity: 0, x: -50 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   transition={{ duration: 0.8 }}
//                   className="relative"
//                 >
//                   <svg
//                     width="400"
//                     height="400"
//                     viewBox="0 0 400 400"
//                     className="w-full h-auto max-w-md drop-shadow-lg"
//                   >
//                     <title>Access Denied Shield</title>
//                     <defs>
//                       <linearGradient
//                         id="access-gradient"
//                         x1="0%"
//                         y1="0%"
//                         x2="100%"
//                         y2="100%"
//                       >
//                         <stop offset="0%" stopColor="#f59e0b" />
//                         <stop offset="100%" stopColor="#eab308" />
//                       </linearGradient>
//                       <filter id="access-glow">
//                         <feGaussianBlur stdDeviation="3" result="coloredBlur" />
//                         <feMerge>
//                           <feMergeNode in="coloredBlur" />
//                           <feMergeNode in="SourceGraphic" />
//                         </feMerge>
//                       </filter>
//                     </defs>

//                     {/* Shield with lock */}
//                     <motion.path
//                       d="M200,50 L300,100 L300,200 C300,280 200,350 200,350 C200,350 100,280 100,200 L100,100 Z"
//                       fill="url(#access-gradient)"
//                       fillOpacity="0.15"
//                       stroke="url(#access-gradient)"
//                       strokeWidth="3"
//                       filter="url(#access-glow)"
//                       animate={{
//                         pathLength: [0, 1],
//                       }}
//                       transition={{ duration: 2, ease: "easeInOut" }}
//                     />

//                     {/* Lock */}
//                     <motion.g
//                       animate={{
//                         scale: [0.9, 1.1, 0.9],
//                       }}
//                       transition={{
//                         duration: 3,
//                         repeat: Infinity,
//                         ease: "easeInOut",
//                       }}
//                     >
//                       <rect
//                         x="170"
//                         y="180"
//                         width="60"
//                         height="40"
//                         rx="5"
//                         fill="url(#access-gradient)"
//                         fillOpacity="0.2"
//                         filter="url(#access-glow)"
//                       />
//                       <path
//                         d="M180,180 L180,170 C180,160 190,150 200,150 C210,150 220,160 220,170 L220,180"
//                         stroke="url(#access-gradient)"
//                         strokeWidth="3"
//                         fill="none"
//                       />
//                       <circle
//                         cx="200"
//                         cy="200"
//                         r="5"
//                         fill="url(#access-gradient)"
//                       />
//                     </motion.g>

//                     {/* X mark */}
//                     <motion.g
//                       animate={{
//                         opacity: [0, 1],
//                       }}
//                       transition={{ duration: 1, delay: 1 }}
//                     >
//                       <path
//                         d="M180,180 L220,220"
//                         stroke="#f59e0b"
//                         strokeWidth="5"
//                         strokeLinecap="round"
//                         filter="url(#access-glow)"
//                       />
//                       <path
//                         d="M220,180 L180,220"
//                         stroke="#f59e0b"
//                         strokeWidth="5"
//                         strokeLinecap="round"
//                         filter="url(#access-glow)"
//                       />
//                     </motion.g>

//                     {/* Floating elements */}
//                     <motion.circle
//                       cx="150"
//                       cy="120"
//                       r="6"
//                       fill="#f59e0b"
//                       filter="url(#access-glow)"
//                       animate={{
//                         cx: [150, 160, 150],
//                         cy: [120, 110, 120],
//                         opacity: [0.4, 0.8, 0.4],
//                       }}
//                       transition={{
//                         duration: 4,
//                         repeat: Infinity,
//                         ease: "easeInOut",
//                       }}
//                     />
//                     <motion.circle
//                       cx="250"
//                       cy="130"
//                       r="5"
//                       fill="#eab308"
//                       filter="url(#access-glow)"
//                       animate={{
//                         cx: [250, 240, 250],
//                         cy: [130, 140, 130],
//                         opacity: [0.4, 0.8, 0.4],
//                       }}
//                       transition={{
//                         duration: 3.5,
//                         repeat: Infinity,
//                         ease: "easeInOut",
//                         delay: 1,
//                       }}
//                     />
//                   </svg>
//                 </motion.div>

//                 {/* 3D Text positioned at different locations */}
//                 <Animated3DText
//                   text="Access Denied"
//                   className="absolute top-0 left-0 right-0 text-center text-xl"
//                   delay={0.5}
//                   color="text-amber-600"
//                 />

//                 <Animated3DSubtitle
//                   text="You don't have the required permissions"
//                   className="absolute top-12 left-0 right-0 text-center"
//                   delay={0.8}
//                   color="text-slate-500"
//                 />

//                 <FloatingText
//                   text="Permission required"
//                   className="bottom-20 left-10"
//                   delay={1.2}
//                   color="text-amber-500"
//                 />

//                 <FloatingText
//                   text="Contact admin"
//                   className="bottom-20 right-10"
//                   delay={1.5}
//                   color="text-yellow-500"
//                 />
//               </div>
//             </div>

//             {/* Right side - Dashboard-style content */}
//             <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.5, delay: 0.2 }}
//                 className="w-full max-w-md"
//               >
//                 <div className="bg-white/95 backdrop-blur-xl rounded-lg shadow-xl overflow-hidden border border-slate-200">
//                   <div className="p-6 border-b border-slate-200">
//                     <div className="flex items-center space-x-3 space-x-reverse">
//                       <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 p-0.5">
//                         <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
//                           <Lock className="h-6 w-6 text-amber-600" />
//                         </div>
//                       </div>
//                       <div>
//                         <h3 className="text-xl font-bold text-slate-800">
//                           Access Denied
//                         </h3>
//                         <p className="text-slate-600">
//                           {permission
//                             ? `You don't have permission: ${permission}`
//                             : "You don't have permission to access this resource."}
//                         </p>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="p-6 space-y-4">
//                     <div className="grid grid-cols-2 gap-4">
//                       <DashboardCard
//                         title="Logged in as"
//                         value={user?.email || "Unknown"}
//                         icon={UserX}
//                         color="amber"
//                         delay={0.3}
//                       />
//                       <DashboardCard
//                         title="Permissions"
//                         value={userPermissions?.length || 0}
//                         icon={Key}
//                         color="red"
//                         delay={0.4}
//                       />
//                     </div>

//                     {userPermissions && userPermissions.length > 0 && (
//                       <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
//                         <h4 className="font-medium text-amber-800 mb-2">
//                           Available Permissions:
//                         </h4>
//                         <div className="flex flex-wrap gap-1">
//                           {userPermissions.map((perm, idx) => (
//                             <Badge
//                               key={idx}
//                               variant="outline"
//                               className="bg-amber-100 text-amber-700 border-amber-200 text-xs"
//                             >
//                               {perm.name}
//                             </Badge>
//                           ))}
//                         </div>
//                       </div>
//                     )}

//                     <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
//                       <div className="flex items-start space-x-3 space-x-reverse">
//                         <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
//                         <div>
//                           <h4 className="font-medium text-amber-800">
//                             Need Access?
//                           </h4>
//                           <p className="text-sm text-amber-700 mt-1">
//                             Contact your system administrator to request the
//                             necessary permissions.
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>
//             </div>
//           </div>
//         </div>
//       )
//     );
//   }

//   return (
//     <>
//       {/* Success animation overlay with proper state management */}
//       <AnimatePresence>
//         {showSuccessAnimation && (
//           <motion.div
//             initial={{ scale: 0, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             exit={{ scale: 0, opacity: 0 }}
//             transition={{ duration: 0.5 }}
//             className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
//           >
//             <motion.div
//               initial={{ scale: 0 }}
//               animate={{ scale: 1 }}
//               exit={{ scale: 0 }}
//               transition={{ duration: 0.5, delay: 0.2 }}
//               className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 p-0.5"
//             >
//               <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
//                 <CheckCircle className="h-8 w-8 text-emerald-600" />
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Render children directly without additional wrapper */}
//       {children}
//     </>
//   );
// }
