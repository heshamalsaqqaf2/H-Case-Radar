import z from "zod";

export const signInSchema = z.object({
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100)
    .regex(
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).+$/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    ),
});

export type SignInSchema = z.infer<typeof signInSchema>;
