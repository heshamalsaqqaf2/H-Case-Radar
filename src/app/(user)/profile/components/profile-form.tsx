"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useUpdateUserProfile } from "@/lib/users/hooks/use-user-profile";
import {
  type UpdateUserProfileInput,
  updateUserProfileSchema,
} from "@/lib/users/validators/user-validator";

interface ProfileFormProps {
  initialData: {
    name: string;
    personalEmail?: string | null;
    image?: string | null;
  };
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const { mutate, isPending } = useUpdateUserProfile();

  const form = useForm<UpdateUserProfileInput>({
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues: {
      name: initialData.name,
      personalEmail: initialData.personalEmail || "",
      image: initialData.image || "",
    },
  });

  function onSubmit(data: UpdateUserProfileInput) {
    mutate(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-md">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الاسم</FormLabel>
              <FormControl>
                <Input placeholder="اسمك الكامل" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="personalEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>البريد الإلكتروني الشخصي</FormLabel>
              <FormControl>
                <Input placeholder="example@gmail.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Image upload could be added here later */}

        <Button type="submit" disabled={isPending}>
          {isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
        </Button>
      </form>
    </Form>
  );
}
