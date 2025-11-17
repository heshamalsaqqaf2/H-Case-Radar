// components/complaints/complaint-comment-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const commentSchema = z.object({
  body: z.string().min(1, "التعليق لا يمكن أن يكون فارغاً"),
});

interface ComplaintCommentFormProps {
  onSubmit: (body: string) => void;
  isPending: boolean;
}

export function ComplaintCommentForm({ onSubmit, isPending }: ComplaintCommentFormProps) {
  const form = useForm<z.infer<typeof commentSchema>>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      body: "",
    },
  });

  const handleSubmit = (values: z.infer<typeof commentSchema>) => {
    onSubmit(values.body);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea placeholder="أضف تعليقاً..." className="min-h-[100px]" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            <Send className="mr-2 h-4 w-4" />
            {isPending ? "جاري الإرسال..." : "إرسال"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
