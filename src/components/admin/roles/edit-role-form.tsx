"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Shield } from "lucide-react";
import Link from "next/link";
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
import { useUpdateRole } from "@/lib/hooks/use-roles";
import { RolePermissionsManager } from "./role-permissions-manager";

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

// تحسين تعريف الـ interface
interface EditRoleFormProps {
  role: {
    id: string;
    name: string;
    description: string | null;
    isDefault: boolean | null;
    createdAt: Date;
    updatedAt: Date;
    permissions: Array<{
      permissionId: string;
      permissionName: string;
      resource: string;
      action: string;
    }>;
  };
}

export function EditRoleForm({ role }: EditRoleFormProps) {
  const updateRoleMutation = useUpdateRole();

  // معالجة القيم الافتراضية للبيانات التي قد تكون null
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: role.name,
      description: role.description || "",
      isDefault: role.isDefault || false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    const formData = new FormData();
    formData.append("id", role.id);
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("isDefault", data.isDefault ? "true" : "false");

    await updateRoleMutation.mutateAsync(formData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/roles">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-500" />
            Edit Role: {role.name}
          </h1>
          <p className="text-gray-600 mt-1">
            Modify role details and permissions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Role Details Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Role Details</CardTitle>
            <CardDescription>
              Update the basic information for this role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
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
                        Unique identifier for the role
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
                        Brief description of the role's purpose
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

                <Button
                  type="submit"
                  disabled={updateRoleMutation.isPending}
                  className="gap-2"
                >
                  {updateRoleMutation.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Update Role
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Permissions Manager */}
        <div className="space-y-6">
          <RolePermissionsManager role={role} />

          {/* Role Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Role Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="font-medium">Created:</span>
                <p className="text-gray-600">
                  {new Date(role.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="font-medium">Last Updated:</span>
                <p className="text-gray-600">
                  {new Date(role.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="font-medium">ID:</span>
                <p className="text-gray-600 font-mono text-xs">{role.id}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
