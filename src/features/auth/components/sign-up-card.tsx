"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CustomInput from "@/components/ui/custom-input";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import api from "@/lib/ky";
import { zodResolver } from "@hookform/resolvers/zod";
import { HTTPError } from "ky";
import { isRedirectError } from "next/dist/client/components/redirect";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signUpSchema } from "../lib/validators";
import { SignInFlow } from "../types";
import ErrorAlert from "./error-alert";
import { GithubAuthButton, GoogleAuthButton } from "./oauth-buttons";
import { User } from "@prisma/client";
import { useRouter } from "next/navigation";
type SignUpCardProps = {
  setState: (state: SignInFlow) => void;
};
export const SignUpCard = ({ setState }: SignUpCardProps) => {
  const [error, setError] = useState<string>("");
  const [pending, setPending] = useState<boolean>(false);
const {push} = useRouter()
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      fullname: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof signUpSchema>): Promise<void> {
    setPending(true);
    try {
      setError("");
      const user = await api.post("/api/auth/sign-up", { json: values }).json<User | null>();
      if(user){
        push("/")
      }
    } catch (error) {
      console.error(error);
      if (isRedirectError(error)) {
        throw error;
      }
      if (error instanceof HTTPError) {
        const errorJson = await error.response.json();
        setError(errorJson.error);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="w-full h-full p-8">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="">Sign up to continue</CardTitle>
        <CardDescription>
          Use your email or another service to continue
        </CardDescription>
      </CardHeader>
      {!!error && <ErrorAlert error={error} />}
      <CardContent className="space-y-5 px-0 pb-0">
        <Form {...form}>
          <form className="space-y-2.5" onSubmit={form.handleSubmit(onSubmit)}>
            <CustomInput
              disabled={pending}
              type="text"
              control={form.control}
              name="fullname"
              placeholder="Full name"
            />
            <CustomInput
              disabled={pending}
              type="email"
              control={form.control}
              name="email"
              placeholder="Email address"
            />
            <CustomInput
              disabled={pending}
              type="password"
              control={form.control}
              name="password"
              placeholder="Password"
            />
            <CustomInput
              disabled={pending}
              type="password"
              control={form.control}
              name="confirmPassword"
              placeholder="ConfirmPassword"
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={pending}
            >
              continue
            </Button>
          </form>
        </Form>
        <Separator />
        <div className="flex flex-col gap-y-2.5">
          <GoogleAuthButton />
          <GithubAuthButton />
        </div>
        <p className="text-xs text-muted-foreground">
          Already have an account?{" "}
          <span
            onClick={() => setState("signIn")}
            className="text-sky-700 hover:underline cursor-pointer"
          >
            Sign in
          </span>
        </p>
      </CardContent>
    </Card>
  );
};
