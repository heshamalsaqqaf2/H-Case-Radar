// components/admin/users/users-list.tsx
/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
"use client";

import {
  ArrowDown,
  ArrowUp,
  Ban,
  Calendar,
  DollarSign,
  Edit,
  Mail,
  Mailbox,
  MoreHorizontal,
  Pin,
  Settings,
  Share2,
  Shield,
  ShieldBan,
  ShoppingCart,
  Trash,
  TrendingUp,
  TriangleAlert,
  User,
  UserCheck,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBanUser, useUnbanUser, useUsers } from "@/lib/authorization/hooks/admin/use-users";
import type { UserWithRoles } from "@/lib/authorization/types/user";
import { EffectCard } from "../../components/ui/effect-card";
import { CreateUserForm } from "./create-user-form";
import { UserEditDialog } from "./user-edit-dialog";
import { UserRolesDialog } from "./user-roles-dialog";
import { UserStatisticsCard } from "./user-statistics-card";

interface UsersListProps {
  initialUsers?: UserWithRoles[];
}

export function UsersList({ initialUsers }: UsersListProps) {
  // Data fetching
  const {
    data: usersResult,
    isLoading,
    error,
  } = useUsers({
    initialData: initialUsers ? { success: true, data: initialUsers } : undefined,
  });
  const banMutation = useBanUser();
  const unbanMutation = useUnbanUser();

  // State management
  const [editingUser, setEditingUser] = useState<UserWithRoles | null>(null);
  const [managingRolesUser, setManagingRolesUser] = useState<UserWithRoles | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);

  // Loading states
  if (isLoading) {
    return <UsersListSkeleton />;
  }
  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="pt-6">
          <div className="text-center text-destructive">
            <p className="font-semibold">خطأ في تحميل المستخدمين</p>
            <p className="text-xl mt-1">{error.name}</p>
            <p className="text-sm mt-1">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  if (!usersResult?.success) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="pt-6">
          <div className="text-center text-destructive">
            <p className="font-semibold">حدث خطأ غير متوقع</p>
            <p className="text-sm mt-1">{usersResult?.error.message || "يرجى المحاولة مرة أخرى"}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const users = usersResult.data;
  // Helper functions
  const handleToggleBan = async (user: UserWithRoles) => {
    if (user.banned) {
      await unbanMutation.mutateAsync({ targetUserId: user.id });
    } else {
      await banMutation.mutateAsync({
        targetUserId: user.id,
        reason: "تم حظر المستخدم من قبل الإدارة",
      });
    }
  };
  const formatDate = (date: Date | null): string => {
    if (!date) return "لم يسجل دخول";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const getStatusVariant = (user: UserWithRoles) => {
    if (user.banned) return "bg-red-100 text-red-500";
    if (user.emailVerified) return "bg-green-100 text-green-500";
    return "bg-orange-100 text-orange-500";
  };
  const getStatusText = (user: UserWithRoles) => {
    if (user.banned) return "محظور";
    if (user.emailVerified) return "نشط";
    return "غير متحقق";
  };

  const getUserRoleColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-violet-600 text-violet-50";
      case "admin":
        return "bg-sky-600 text-sky-50";
      case "user":
        return "bg-neutral-800 text-neutral-50";
      default:
        return "bg-orange-600 text-orange-50";
    }
  };

  // Statistics
  const totalRoles = users.reduce((acc, user) => acc + user.roles.length, 0);
  const totalBanned = users.filter((user) => user.banned).length;
  const totalActive = users.filter((user) => user.banned).length;
  // const stats = [
  //   {
  //     title: "المستخدمون النشطون",
  //     value: totalActive,
  //     lastMonth: totalActive,
  //     delta: 0.2,
  //     positive: true,
  //     prefix: "",
  //     suffix: "",
  //     bg: "",
  //     svg: (
  //       <svg
  //         className="absolute right-0 top-0 h-full w-2/3 pointer-events-none"
  //         viewBox="0 0 300 200"
  //         fill="none"
  //         style={{ zIndex: 0 }}
  //       >
  //         <title>المستخدمون النشطون</title>
  //         <circle cx="220" cy="100" r="90" fill="#fff" fillOpacity="0.08" />
  //         <circle cx="260" cy="60" r="60" fill="#fff" fillOpacity="0.10" />
  //         <circle cx="200" cy="160" r="50" fill="#fff" fillOpacity="0.07" />
  //         <circle cx="270" cy="150" r="30" fill="#fff" fillOpacity="0.12" />
  //       </svg>
  //     ),
  //   },
  //   {
  //     title: "المستخدمون المحظورين",
  //     value: totalBanned,
  //     lastMonth: totalBanned,
  //     delta: 3.1,
  //     positive: true,
  //     prefix: "",
  //     suffix: "",
  //     bg: "",
  //     svg: (
  //       <svg
  //         className="absolute right-0 top-0 w-48 h-48 pointer-events-none"
  //         viewBox="0 0 200 200"
  //         fill="none"
  //         style={{ zIndex: 0 }}
  //       >
  //         <title>New Customers</title>
  //         <defs>
  //           <filter id="blur2" x="-20%" y="-20%" width="140%" height="140%">
  //             <feGaussianBlur stdDeviation="10" />
  //           </filter>
  //         </defs>
  //         <ellipse
  //           cx="170"
  //           cy="60"
  //           rx="40"
  //           ry="18"
  //           fill="#fff"
  //           fillOpacity="0.13"
  //           filter="url(#blur2)"
  //         />
  //         <rect x="120" y="20" width="60" height="20" rx="8" fill="#fff" fillOpacity="0.10" />
  //         <polygon points="150,0 200,0 200,50" fill="#fff" fillOpacity="0.07" />
  //         <circle cx="180" cy="100" r="14" fill="#fff" fillOpacity="0.16" />
  //       </svg>
  //     ),
  //   },
  //   {
  //     title: "الأدوار الممنوحة",
  //     value: totalRoles,
  //     lastMonth: totalRoles,
  //     delta: 1.2,
  //     positive: true,
  //     prefix: "",
  //     suffix: "",
  //     bg: "",
  //     svg: (
  //       <svg
  //         className="absolute right-0 top-0 w-48 h-48 pointer-events-none"
  //         viewBox="0 0 200 200"
  //         fill="none"
  //         style={{ zIndex: 0 }}
  //       >
  //         <title>Refunds</title>
  //         <defs>
  //           <filter id="blur3" x="-20%" y="-20%" width="140%" height="140%">
  //             <feGaussianBlur stdDeviation="12" />
  //           </filter>
  //         </defs>
  //         <rect
  //           x="120"
  //           y="0"
  //           width="70"
  //           height="70"
  //           rx="35"
  //           fill="#fff"
  //           fillOpacity="0.09"
  //           filter="url(#blur3)"
  //         />
  //         <ellipse cx="170" cy="80" rx="28" ry="12" fill="#fff" fillOpacity="0.12" />
  //         <polygon points="200,0 200,60 140,0" fill="#fff" fillOpacity="0.07" />
  //         <circle cx="150" cy="30" r="10" fill="#fff" fillOpacity="0.15" />
  //       </svg>
  //     ),
  //   },
  //   {
  //     title: "كل المستخدمين",
  //     value: users.length,
  //     lastMonth: users.length,
  //     delta: -0.1,
  //     positive: false,
  //     prefix: "",
  //     suffix: "",
  //     bg: "",
  //     svg: (
  //       <svg
  //         className="absolute right-0 top-0 w-48 h-48 pointer-events-none"
  //         viewBox="0 0 200 200"
  //         fill="none"
  //         style={{ zIndex: 0 }}
  //       >
  //         <title>Churn Rate</title>
  //         <defs>
  //           <filter id="blur4" x="-20%" y="-20%" width="140%" height="140%">
  //             <feGaussianBlur stdDeviation="12" />
  //           </filter>
  //         </defs>
  //         <polygon points="200,0 200,100 100,0" fill="#fff" fillOpacity="0.09" />
  //         <ellipse
  //           cx="170"
  //           cy="40"
  //           rx="30"
  //           ry="18"
  //           fill="#fff"
  //           fillOpacity="0.13"
  //           filter="url(#blur4)"
  //         />
  //         <rect x="140" y="60" width="40" height="18" rx="8" fill="#fff" fillOpacity="0.10" />
  //         <circle cx="150" cy="30" r="14" fill="#fff" fillOpacity="0.18" />
  //         <line
  //           x1="120"
  //           y1="0"
  //           x2="200"
  //           y2="80"
  //           stroke="#fff"
  //           strokeOpacity="0.08"
  //           strokeWidth="6"
  //         />
  //       </svg>
  //     ),
  //   },
  // ];

  const stats = [
    {
      title: 'المستخدمون النشطون',
      value: '5',
      delta: 12.5,
      lastMonth: '7,603',
      bgColor: 'bg-gradient-to-br from-emerald-400 to-emerald-500',
      icon: UserCheck,
      iconColor: 'text-emerald-600',
    },
    {
      title: 'إجمالي المستخدمون',
      value: '24',
      delta: -2.4,
      lastMonth: '25,389',
      bgColor: 'from-emerald-50 to-teal-100',
      icon: Users,
      iconColor: 'text-emerald-600',
    },
    {
      title: 'المستخدمون المحظورين',
      value: '19',
      delta: 8.1,
      lastMonth: '1,687',
      bgColor: 'from-purple-50 to-pink-100',
      icon: ShieldBan,
      iconColor: 'text-purple-600',
    },
    {
      title: 'إجمالي الأدوار',
      value: '5',
      delta: 4.3,
      lastMonth: '3.11%',
      bgColor: 'from-orange-50 to-amber-100',
      icon: Shield,
      iconColor: 'text-orange-600',
    },
  ];



  return (
    <div className="space-y-2">
      {/* <div className="flex flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">إدارة المستخدمين</h1>
          <p className="text-muted-foreground mt-1">إدارة حسابات المستخدمين، الأدوار، والصلاحيات</p>
        </div>
        <CreateUserForm />
      </div> */}

      {/* Statistics Users Cards */}
      <div className="flex items-center justify-center lg:py-5">

        <div className="grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const isPositive = stat.delta > 0;
            return (
              <Card
                key={index}
                className="relative overflow-hidden border-0 shadow-none rounded-lg p-4"
              >
                <EffectCard />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.title}</p>
                    <p className="text-4xl font-bold text-foreground mt-2">{stat.value}</p>
                    <div className="flex items-center mt-3 space-x-2 space-x-reverse">
                      {isPositive ? (
                        <ArrowUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-red-500" />
                      )}
                      <span className={`text-sm font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {Math.abs(stat.delta)}%
                      </span>
                      <span className="text-sm text-gray-400">vs last month</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full  ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 hover:blur-sm hover:from-emerald-50 hover:to-teal-100 hover:transition-colors hover:duration-300 ${stat.iconColor}`} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* <div className="grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card
              key={index.toString()}
              className={`relative overflow-hidden ${stat.bg} rounded-none`}
            >
              <EffectCard />

              <CardHeader className="border-0 z-10 relative">
                <CardTitle className="text-base font-medium">{stat.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 z-10 relative">
                <div className="flex-row-reverse flex justify-between items-center gap-2.5">
                  <span className="text-5xl ml-3 skew-x-12 -skew-y-12 -rotate-12 -translate-y-2 blur-none drop-shadow-[0_0_15px_rgba(0,242,255,10)]  font-semibold">{stat.value}</span>
                  <Badge className="font-semibold">
                    {stat.delta > 0 ? (
                      <ArrowUp className="text-green-400 text-4xl" />
                    ) : (
                      <ArrowDown className="text-red-600 text-4xl" />
                    )}
                    {stat.delta} %
                  </Badge>
                </div>
                <div className="text-xs mt-2 border-t pt-2.5">
                  أخر 30 يوما: <span className="font-medium">{stat.lastMonth}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div> */}
      </div>

      {/* Table Users List */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المستخدمين</CardTitle>
          <CardDescription>عرض وإدارة جميع مستخدمي النظام</CardDescription>
          {/* Create User Form Dialog */}
          <CreateUserForm />
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">ID</TableHead>
                  <TableHead className="w-[110px]">المستخدم</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الأدوار</TableHead>
                  <TableHead>آخر دخول</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user, index = 1) => (
                  <TableRow
                    key={user.id}
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => setSelectedUser(user)}
                  >
                    <TableCell>{++index}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          <Image
                            src={user.image}
                            alt={user.name}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-full"
                          />
                        ) : (
                          <div className="flex h-10 w-10 font-bold text-green-500 items-center justify-center rounded-full bg-muted">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name}</span>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusVariant(user)}>{getStatusText(user)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.slice(0, 2).map((role) => (
                          <Badge
                            key={role.id}
                            title={role.description || ""}
                            className={`text-xs uppercase border-none max-w-[150px] truncate ${getUserRoleColor(role.name)}`}
                          >
                            {role.name}
                          </Badge>
                        ))}
                        {user.roles.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{user.roles.length - 2}
                          </Badge>
                        )}
                        {user.roles.length === 0 && (
                          <span className="text-sm text-muted-foreground">لا توجد أدوار</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(user.lastLoginAt) || "منذ يوم"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingUser(user);
                          }}
                          title="تعديل المستخدم"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setManagingRolesUser(user);
                          }}
                          title="إدارة الأدوار"
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={user.banned ? "default" : "destructive"}
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleBan(user);
                          }}
                          disabled={banMutation.isPending || unbanMutation.isPending}
                          title={user.banned ? "فك الحظر" : "حظر المستخدم"}
                        >
                          {user.banned ? (
                            <UserCheck className="h-4 w-4" />
                          ) : (
                            <Ban className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">لا يوجد مستخدمين</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs for editing user */}
      {editingUser && (
        <UserEditDialog
          user={editingUser}
          open={!!editingUser}
          onOpenChange={() => setEditingUser(null)}
        />
      )}
      {/* Dialogs for managing roles */}
      {managingRolesUser && (
        <UserRolesDialog
          user={managingRolesUser}
          open={!!managingRolesUser}
          onOpenChange={() => setManagingRolesUser(null)}
        />
      )}
      {/* Dialogs for user statistics */}
      {selectedUser && (
        <UserStatisticsCard
          user={selectedUser}
          open={!!selectedUser}
          onOpenChange={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}

function UsersListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-md bg-muted" />
          <Skeleton className="h-4 w-64 rounded-md bg-gray-400" />
        </div>
        <Skeleton className="h-6 w-16 rounded-md bg-gray-400" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <>
          <Skeleton key={index} className="h-24 w-full rounded-md bg-gray-400" />
        ))}
      </div>
      <Skeleton className="h-72 w-full rounded-md bg-gray-400" />
    </div>
  );
}
