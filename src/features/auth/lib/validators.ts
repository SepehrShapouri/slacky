import { z } from "zod";

// Extend your schema with a confirmPassword field
export const signUpSchema = z
  .object({
    fullname: z.string().min(2, "fullname is required"),
    email: z
      .string()
      .min(1, "email is required")
      .email("Invalid email address"),
    password: z
      .string()
      .min(8, "Your password should be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"], // Point to confirmPassword field
    message: "Passwords don't match", // Error message
  });

export const signInSchema = z.object({
  email: z.string().min(1, "email is required").email("Invalid email address"),
  password: z.string().min(8, "Your password should be at least 8 characters"),
});
