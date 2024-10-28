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
import { signInSchema } from "../lib/validators";
import { SignInFlow } from "../types";
import ErrorAlert from "./error-alert";
import { GithubAuthButton, GoogleAuthButton } from "./oauth-buttons";
import { User } from "@prisma/client";
import { useRouter } from "next/navigation";
type SignInCardProps = {
  setState: (state: SignInFlow) => void;
};
export const SignInCard = ({ setState }: SignInCardProps) => {
  const [error, setError] = useState<string>("");
  const [pending, setPending] = useState<boolean>(false);
  const { push } = useRouter();
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof signInSchema>): Promise<void> {
    setPending(true);
    try {
      setError("");
      const user = await api
        .post("/api/auth/sign-in", { json: values })
        .json<User | null>();
      if (user) {
        push("/");
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
        <CardTitle className="">Sign in to continue</CardTitle>
        <CardDescription>
          Use your email or another service to continue
        </CardDescription>
      </CardHeader>
      {!!error && <ErrorAlert error={error} />}
      <CardContent className="space-y-5 px-0 pb-0">
        <Form {...form}>
          <form className="space-y-2.5" onSubmit={form.handleSubmit(onSubmit)}>
            <CustomInput
              type="email"
              control={form.control}
              name="email"
              placeholder="Email address"
            />
            <CustomInput
              type="password"
              control={form.control}
              name="password"
              placeholder="Password"
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
          Dont&apos; have an account?{" "}
          <span
            onClick={() => setState("signUp")}
            className="text-sky-700 hover:underline cursor-pointer"
          >
            Sign up
          </span>
        </p>
      </CardContent>
    </Card>
  );
};
