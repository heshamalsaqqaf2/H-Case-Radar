"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const activities = [
  {
    id: 1,
    action: "User Created",
    description: "New user john@example.com registered",
    timestamp: "2 minutes ago",
    type: "user",
  },
  {
    id: 2,
    action: "Role Updated",
    description: "Admin role permissions modified",
    timestamp: "1 hour ago",
    type: "role",
  },
  {
    id: 3,
    action: "Permission Added",
    description: "New permission settings.edit created",
    timestamp: "3 hours ago",
    type: "permission",
  },
  {
    id: 4,
    action: "System Update",
    description: "Database seeding completed",
    timestamp: "5 hours ago",
    type: "system",
  },
];

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4">
              <div className="shrink-0">
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${activity.type === "user"
                      ? "bg-blue-500"
                      : activity.type === "role"
                        ? "bg-green-500"
                        : activity.type === "permission"
                          ? "bg-purple-500"
                          : "bg-orange-500"
                    }`}
                />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <Badge variant="outline" className="text-xs">
                    {activity.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
                <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
