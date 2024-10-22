import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React from "react";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

export function GoogleAuthButton() {
  return (
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
  );
}

export function GithubAuthButton() {
  return (
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
  );
}
