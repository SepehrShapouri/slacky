import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import { TriangleAlert } from "lucide-react";
import { useState } from "react";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { SignInFlow } from "../types";
import { cn } from "@/lib/utils";
type SignInCardProps = {
  setState: (state: SignInFlow) => void;
};
export const SignInCard = ({ setState }: SignInCardProps) => {
  const pending = false;
  const error = "";
  return (
    <Card className="w-full h-full p-8">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="">Login to continue</CardTitle>
        <CardDescription>
          Use your email or another service to continue
        </CardDescription>
      </CardHeader>
      {!!error && (
        <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-6">
          <TriangleAlert className="size-4" />
          <p>{error}</p>
        </div>
      )}
      <CardContent className="space-y-5 px-0 pb-0">
        <form className="space-y-2.5">
          <Input
            disabled={pending}
            value={""}
            placeholder="Email"
            type="email"
            required
          />
          <Input
            disabled={pending}
            placeholder="Password"
            type="password"
            required
          />
          <Button type="submit" className="w-full" size="lg" disabled={pending}>
            continue
          </Button>
        </form>
        <Separator />
        <div className="flex flex-col gap-y-2.5">
          <a
            href="/auth/google"
            className={cn(
              buttonVariants({
                className: "w-full relative",
                variant: "outline",
                size: "lg",
              })
            )}
          >
            {" "}
            <FcGoogle className="!size-5 absolute left-2.5" fontSize={12} />
            Continue with Google
          </a>
          <a
            href="/auth/github"
            className={cn(
              buttonVariants({
                className: "w-full relative",
                variant: "outline",
                size: "lg",
              })
            )}
          >
            {" "}
            <FaGithub className="!size-5 absolute left-2.5" />
            Continue with Github
          </a>
        </div>
        <p className="text-xs text-muted-foreground">
          Don&apos;t have an account?{" "}
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
