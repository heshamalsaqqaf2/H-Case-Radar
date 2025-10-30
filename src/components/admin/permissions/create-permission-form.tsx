// components/admin/permissions/create-permission-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@radix-ui/react-dialog";
import { CircleAlertIcon, Key, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Label } from "recharts";
import { toast } from "sonner";
import { z } from "zod";
import { id } from "zod/v4/locales";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DialogFooter, DialogHeader } from "@/components/ui/dialog";
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
import { useCreatePermission } from "@/lib/authorization/hooks/permission/use-permissions";

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

export function CreatePermissionForm() {
  const [open, setOpen] = useState(false);
  const createPermissionMutation = useCreatePermission();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      resource: "",
      action: "",
      conditions: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    const formData = new FormData();
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
    const result = await createPermissionMutation.mutateAsync(formData);
    if (result.success) {
      toast.success("نجحت العملية", { description: result.message });
      form.reset();
      setOpen(true);
    } else {
      toast.error("فشلت العملية", { description: result.message });
    }
  };

  return (
    <div className="space-y-6 flex flex-col justify-center items-center m-auto">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="default" onClick={() => setOpen(true)}>
            <Key className="mr-2 h-4 w-4" /> انشاء صلاحية
          </Button>
        </DialogTrigger>

        <DialogContent>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-blue-600" />
                إنشاء صلاحية
              </CardTitle>
              <CardDescription>تحديد صلاحية جديدة للنظام</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
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
                          المعرف الفريد لهذا الإذن (على سبيل المثال،
                          user.create) الوصف
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
                        <FormLabel>الوصف</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="صف ما يسمح به هذا الإذن..."
                            {...field}
                            rows={2}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
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
                          <FormLabel>الإجراء</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select action" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="read">Read</SelectItem>
                              <SelectItem value="create">Create</SelectItem>
                              <SelectItem value="update">Update</SelectItem>
                              <SelectItem value="delete">Delete</SelectItem>
                              <SelectItem value="manage">Manage</SelectItem>
                              <SelectItem value="assign">Assign</SelectItem>
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
                        <FormLabel>شروط (ABAC) اختيارية</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={`{\n  "department": "IT",\n  "level": { "gte": 3 }\n}`}
                            {...field}
                            rows={4}
                            className="font-mono text-xs"
                          />
                        </FormControl>
                        <FormDescription>
                          كائن JSON للوصول المشروط (ABAC). اذا لا تريد أي شروط،
                          قم بتركه فارغا
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={createPermissionMutation.isPending}
                    className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    {createPermissionMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        جار إنشاء الصلاحية...
                      </>
                    ) : (
                      <>
                        <Key className="h-4 w-4" />
                        إنشاء الصلاحية
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  );
}
// <Card>
//   <CardHeader>
//     <CardTitle className="flex items-center gap-2">
//       <Plus className="h-5 w-5 text-blue-600" />
//       إنشاء صلاحية
//     </CardTitle>
//     <CardDescription>تحديد صلاحية جديدة للنظام</CardDescription>
//   </CardHeader>
//   <CardContent>
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//         <FormField
//           control={form.control}
//           name="name"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>إسم الصلاحية</FormLabel>
//               <FormControl>
//                 <Input
//                   placeholder="e.g., user.create, post.delete.own"
//                   {...field}
//                 />
//               </FormControl>
//               <FormDescription>
//                 المعرف الفريد لهذا الإذن (على سبيل المثال، user.create)
//                 الوصف
//               </FormDescription>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         <FormField
//           control={form.control}
//           name="description"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>الوصف</FormLabel>
//               <FormControl>
//                 <Textarea
//                   placeholder="صف ما يسمح به هذا الإذن..."
//                   {...field}
//                   rows={2}
//                 />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         <div className="grid grid-cols-2 gap-4">
//           <FormField
//             control={form.control}
//             name="resource"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>المصدر</FormLabel>
//                 <FormControl>
//                   <Input placeholder="e.g., user, post, admin" {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={form.control}
//             name="action"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>الإجراء</FormLabel>
//                 <Select
//                   onValueChange={field.onChange}
//                   defaultValue={field.value}
//                 >
//                   <FormControl>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select action" />
//                     </SelectTrigger>
//                   </FormControl>
//                   <SelectContent>
//                     <SelectItem value="read">Read</SelectItem>
//                     <SelectItem value="create">Create</SelectItem>
//                     <SelectItem value="update">Update</SelectItem>
//                     <SelectItem value="delete">Delete</SelectItem>
//                     <SelectItem value="manage">Manage</SelectItem>
//                     <SelectItem value="assign">Assign</SelectItem>
//                   </SelectContent>
//                 </Select>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//         </div>

//         <FormField
//           control={form.control}
//           name="conditions"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>شروط (ABAC) اختيارية</FormLabel>
//               <FormControl>
//                 <Textarea
//                   placeholder={`{\n  "department": "IT",\n  "level": { "gte": 3 }\n}`}
//                   {...field}
//                   rows={4}
//                   className="font-mono text-xs"
//                 />
//               </FormControl>
//               <FormDescription>
//                 كائن JSON للوصول المشروط (ABAC). اذا لا تريد أي شروط، قم
//                 بتركه فارغا
//               </FormDescription>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         <Button
//           type="submit"
//           disabled={createPermissionMutation.isPending}
//           className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
//         >
//           {createPermissionMutation.isPending ? (
//             <>
//               <Loader2 className="h-4 w-4 animate-spin" />
//               جار إنشاء الصلاحية...
//             </>
//           ) : (
//             <>
//               <Key className="h-4 w-4" />
//               إنشاء الصلاحية
//             </>
//           )}
//         </Button>
//       </form>
//     </Form>
//   </CardContent>
// </Card>
