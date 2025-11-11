// components/admin/users/user-statistics-card.tsx
"use client";

import { BarChart3, Calendar, LogIn, Mail, Shield, User } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserStatistics } from "@/lib/authorization/hooks/admin/use-users";
import type { UserWithRoles } from "@/lib/authorization/types/user";

interface UserStatisticsCardProps {
  user: UserWithRoles;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserStatisticsCard({ user, open, onOpenChange }: UserStatisticsCardProps) {
  const { data: statsResult, isLoading } = useUserStatistics(user.id);

  const formatDate = (date: Date | null): string => {
    if (!date) return "غير متوفر";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            إحصائيات المستخدم
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <UserStatisticsSkeleton />
        ) : (
          <div className="space-y-6">
            {/* معلومات المستخدم */}
            <Card>
              <CardHeader>
                <CardTitle>معلومات المستخدم</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name}
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded-full"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <User className="h-8 w-8" />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{user.name}</h3>
                      <Badge variant={user.banned ? "destructive" : "default"}>
                        {user.banned ? "محظور" : "نشط"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {user.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      انضم في {formatDate(user.createdAt)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* الإحصائيات */}
            {statsResult?.success && (
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">عدد الأدوار</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {statsResult.data.statistics.rolesCount}
                    </div>
                    <p className="text-xs text-muted-foreground">دور ممنوح للمستخدم</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">مرات الدخول</CardTitle>
                    <LogIn className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {statsResult.data.statistics.loginCount}
                    </div>
                    <p className="text-xs text-muted-foreground">مرة دخول إلى النظام</p>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
              {/* آخر نشاط */}
              {statsResult?.success && statsResult.data.statistics.lastActivity && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">آخر نشاط</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(statsResult.data.statistics.lastActivity)}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* معلومات الحظر */}
              {user.banned && (
                <Card className="border-destructive/70 bg-destructive/10">
                  <CardHeader>
                    <CardTitle className="text-sm text-destructive">معلومات الحظر</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <strong>سبب الحظر:</strong> {user.banReason || "غير محدد"}
                      </p>
                      {user.banExpires && (
                        <p className="text-sm">
                          <strong>ينتهي الحظر في:</strong> {formatDate(user.banExpires)}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function UserStatisticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
      <Skeleton className="h-16 w-full" />
    </div>
  );
}
