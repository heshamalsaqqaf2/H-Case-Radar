"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, Key, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUpdatePermission } from "@/lib/authorization/hooks/permission/use-permissions";
import type { SafePermission } from "@/lib/types/permission";

const formSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      "Name can only contain letters, numbers, dots, underscores, and hyphens",
    ),
  description: z
    .string()
    .max(200, "Description must be less than 200 characters")
    .optional(),
  resource: z.string().min(1, "Resource is required"),
  action: z.string().min(1, "Action is required"),
  conditions: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditPermissionFormProps {
  permission: SafePermission;
  onSuccess?: () => void;
}

export function EditPermissionForm({ permission }: EditPermissionFormProps) {
  const updatePermissionMutation = useUpdatePermission();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: permission.name,
      description: permission.description || "",
      resource: permission.resource,
      action: permission.action,
      conditions: permission.conditions
        ? JSON.stringify(permission.conditions, null, 2)
        : "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    const formData = new FormData();
    formData.append("id", permission.id);
    formData.append("name", data.name);
    formData.append("description", data.description || "");
    formData.append("resource", data.resource);
    formData.append("action", data.action);

    if (data.conditions) {
      try {
        JSON.parse(data.conditions); // التحقق من صحة JSON
        formData.append("conditions", data.conditions);
      } catch {
        toast.error("Invalid JSON in conditions");
        return;
      }
    }

    const result = await updatePermissionMutation.mutateAsync(formData);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error("Error", { description: result.message });
    }
  };

  return (
    <div className="container space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/permissions">
          <Button variant="outline" size="icon">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            تحديث الصلاحية
          </h1>
          <p className="text-blue-600 font-bold mt-1 ml-2">
            {permission.name.toUpperCase()}
          </p>
        </div>
      </div>
      <div className="w-fit m-auto">
        <Card>
          <CardHeader>
            <CardTitle>تفاصيل الصلاحية</CardTitle>
            <CardDescription>تحديث تكوين الصلاحيات</CardDescription>
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
                      <FormLabel>إسم الصلاحية</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., user.create, post.delete.own"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        المعرف الفريد لهذا الإذن (يجب أن يكون فريدًا)
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
                      <FormLabel>وصف الصلاحية</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe what this permission allows..."
                          {...field}
                          rows={2}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="resource"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المصدر</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., user, post, admin"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="action"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>العملية</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl className="w-full">
                            <SelectTrigger>
                              <SelectValue placeholder="Select action" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="read">عرض</SelectItem>
                            <SelectItem value="create">إنشاء</SelectItem>
                            <SelectItem value="update">تحديث</SelectItem>
                            <SelectItem value="delete">حذف</SelectItem>
                            <SelectItem value="manage">إدارة</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="conditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الشروط المشروطة (إختياري)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={`{\n  "department": "IT",\n  "level": { "gte": 3 }\n}`}
                          {...field}
                          rows={6}
                          className="text-xs"
                        />
                      </FormControl>
                      <FormDescription>
                        كائن JSON للوصول المشروط. اتركه فارغًا للحصول على إذن
                        ثابت.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={updatePermissionMutation.isPending}
                  className="gap-2"
                >
                  {updatePermissionMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      جاري تحديث الصلاحية
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      حفظ التغييرات
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// // components/admin/permissions/edit-permission-form.tsx
// "use client";

// import { zodResolver } from "@hookform/resolvers/zod";
// import { Key, Loader2, Save } from "lucide-react";
// import Link from "next/link";
// import { useForm } from "react-hook-form";
// import { toast } from "sonner";
// import { z } from "zod";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Textarea } from "@/components/ui/textarea";
// import { useUpdatePermission } from "@/lib/authorization/hooks/permission/use-permissions";
// import type { SafePermission } from "@/lib/types/permission";

// const formSchema = z.object({
//   name: z
//     .string()
//     .min(3, "Name must be at least 3 characters")
//     .max(100, "Name must be less than 100 characters")
//     .regex(
//       /^[a-zA-Z0-9._-]+$/,
//       "Name can only contain letters, numbers, dots, underscores, and hyphens",
//     ),
//   description: z
//     .string()
//     .max(200, "Description must be less than 200 characters")
//     .optional(),
//   resource: z.string().min(1, "Resource is required"),
//   action: z.string().min(1, "Action is required"),
//   conditions: z.string().optional(),
// });

// type FormValues = z.infer<typeof formSchema>;

// interface EditPermissionFormProps {
//   // permission: {
//   //   id: string;
//   //   name: string;
//   //   description: string | null;
//   //   resource: string;
//   //   action: string;
//   //   conditions: Record<string, unknown> | null;
//   // };
//   permission: SafePermission;
//   onSuccess?: () => void;
// }

// export function EditPermissionForm({
//   permission,
//   onSuccess,
// }: EditPermissionFormProps) {
//   const updatePermissionMutation = useUpdatePermission();

//   const form = useForm<FormValues>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       name: permission.name,
//       description: permission.description || "",
//       resource: permission.resource,
//       action: permission.action,
//       conditions: permission.conditions
//         ? JSON.stringify(permission.conditions, null, 2)
//         : "",
//     },
//   });

//   const onSubmit = async (data: FormValues) => {
//     const formData = new FormData();
//     formData.append("id", permission.id);
//     formData.append("name", data.name);
//     formData.append("description", data.description || "");
//     formData.append("resource", data.resource);
//     formData.append("action", data.action);

//     if (data.conditions) {
//       try {
//         JSON.parse(data.conditions); // التحقق من صحة JSON
//         formData.append("conditions", data.conditions);
//       } catch {
//         toast.error("Invalid JSON in conditions");
//         return;
//       }
//     }

//     const result = await updatePermissionMutation.mutateAsync(formData);
//     if (result.success) {
//       toast.success(result.message);
//       onSuccess?.();
//     } else {
//       toast.error("Error", { description: result.message });
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center gap-4">
//         <Link href="/admin/permissions">
//           <Button variant="outline" size="icon">
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               width="16"
//               height="16"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               className="lucide lucide-arrow-left"
//             >
//               <title>Title</title>
//               <path d="m12 19-7-7 7-7" />
//               <path d="M19 12H5" />
//             </svg>
//           </Button>
//         </Link>
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
//             <Key className="h-6 w-6 text-blue-600" />
//             Edit Permission
//           </h1>
//           <p className="text-gray-600 mt-1">{permission.name}</p>
//         </div>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Key className="h-5 w-5 text-blue-600" />
//             Edit Permission
//           </CardTitle>
//           <CardDescription>
//             Update the details of this permission
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//               <FormField
//                 control={form.control}
//                 name="name"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Permission Name</FormLabel>
//                     <FormControl>
//                       <Input
//                         placeholder="e.g., user.create, post.delete.own"
//                         {...field}
//                         // disabled // لا يمكن تغيير الاسم
//                       />
//                     </FormControl>
//                     <FormDescription>
//                       Unique identifier for this permission (cannot be changed)
//                     </FormDescription>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="description"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Description</FormLabel>
//                     <FormControl>
//                       <Textarea
//                         placeholder="Describe what this permission allows..."
//                         {...field}
//                         rows={2}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <div className="grid grid-cols-2 gap-4">
//                 <FormField
//                   control={form.control}
//                   name="resource"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Resource</FormLabel>
//                       <FormControl>
//                         <Input
//                           placeholder="e.g., user, post, admin"
//                           {...field}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 <FormField
//                   control={form.control}
//                   name="action"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Action</FormLabel>
//                       <Select
//                         onValueChange={field.onChange}
//                         defaultValue={field.value}
//                       >
//                         <FormControl>
//                           <SelectTrigger>
//                             <SelectValue placeholder="Select action" />
//                           </SelectTrigger>
//                         </FormControl>
//                         <SelectContent>
//                           <SelectItem value="read">Read</SelectItem>
//                           <SelectItem value="create">Create</SelectItem>
//                           <SelectItem value="update">Update</SelectItem>
//                           <SelectItem value="delete">Delete</SelectItem>
//                           <SelectItem value="manage">Manage</SelectItem>
//                           <SelectItem value="assign">Assign</SelectItem>
//                         </SelectContent>
//                       </Select>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>

//               <FormField
//                 control={form.control}
//                 name="conditions"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>ABAC Conditions (Optional)</FormLabel>
//                     <FormControl>
//                       <Textarea
//                         placeholder={`{\n  "department": "IT",\n  "level": { "gte": 3 }\n}`}
//                         {...field}
//                         rows={4}
//                         className="font-mono text-xs"
//                       />
//                     </FormControl>
//                     <FormDescription>
//                       JSON object for conditional access (ABAC). Leave empty for
//                       static permission.
//                     </FormDescription>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <Button
//                 type="submit"
//                 disabled={
//                   updatePermissionMutation.isPending || !form.formState.isDirty
//                 }
//                 className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
//               >
//                 {updatePermissionMutation.isPending ? (
//                   <>
//                     <Loader2 className="h-4 w-4 animate-spin" />
//                     Saving...
//                   </>
//                 ) : (
//                   <>
//                     <Save className="h-4 w-4" />
//                     Save Changes
//                   </>
//                 )}
//               </Button>
//             </form>
//           </Form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
