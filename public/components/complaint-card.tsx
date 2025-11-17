import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { Calendar, MessageSquare, Paperclip, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { ComplaintSummary } from "@/lib/complaints/types/type-complaints";
import { ComplaintStatusBadge } from "./complaint-status-badge";
import { PriorityBadge } from "./priority-badge";

interface ComplaintCardProps {
  complaint: ComplaintSummary;
  onView: (id: string) => void;
  onEdit?: (id: string) => void;
}

export function ComplaintCard({ complaint, onView, onEdit }: ComplaintCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg leading-7 line-clamp-2">{complaint.title}</CardTitle>
          <div className="flex flex-col items-end gap-2">
            <ComplaintStatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
          </div>
        </div>
        <CardDescription className="line-clamp-2 mt-2">{complaint.category}</CardDescription>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{complaint.assignedUserName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {formatDistanceToNow(complaint.createdAt, {
                  addSuffix: true,
                  locale: ar,
                })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {complaint.hasAttachments && <Paperclip className="h-4 w-4" />}
            {complaint.commentCount > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{complaint.commentCount}</span>
              </div>
            )}
            {complaint.isUrgent && (
              <Badge variant="destructive" className="text-xs">
                عاجل
              </Badge>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 pt-0">
        <Button variant="outline" size="sm" className="flex-1" onClick={() => onView(complaint.id)}>
          عرض التفاصيل
        </Button>
        {onEdit && (
          <Button variant="ghost" size="sm" onClick={() => onEdit(complaint.id)}>
            تعديل
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
