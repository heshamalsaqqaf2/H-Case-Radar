"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateRole } from "@/lib/hooks/use-roles";

// إصلاح schema - جعل isDefault مطلوبة
const formSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Name can only contain letters, numbers and underscores",
    ),
  description: z
    .string()
    .min(5, "Description must be at least 5 characters")
    .max(200, "Description must be less than 200 characters"),
  isDefault: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateRoleForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const createRoleMutation = useCreateRole();

  // إصلاح useForm - إضافة النوع الصريح
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      isDefault: false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("isDefault", data.isDefault ? "true" : "false");

    await createRoleMutation.mutateAsync(formData, {
      onSuccess: (result) => {
        if (result.success) {
          form.reset();
          setIsOpen(false);
          onSuccess?.();
        }
      },
    });
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        Create New Role
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Role</CardTitle>
        <CardDescription>
          Add a new role to your system. Roles define sets of permissions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., content_manager" {...field} />
                  </FormControl>
                  <FormDescription>
                    Unique identifier for the role. Use lowercase with
                    underscores.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what this role can do..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Brief description of the role's purpose and permissions.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isDefault"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Default Role</FormLabel>
                    <FormDescription>
                      Assign this role to new users automatically
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={createRoleMutation.isPending}
                className="gap-2"
              >
                {createRoleMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Create Role
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={createRoleMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
