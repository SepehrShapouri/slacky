"use client";

import { Loader2, LogOut } from "lucide-react";
import { DropdownMenuItem } from "./ui/dropdown-menu";

import { logoutAction } from "@/features/auth/actions";
import { useFormStatus } from "react-dom";
import { Button } from "./ui/button";

function LogoutButton() {
  const { pending } = useFormStatus();

  return (
    <DropdownMenuItem asChild>
        <button type="submit" className="w-full cursor-pointer">
        <LogOut />
        Log out
        </button>
    </DropdownMenuItem>
  );
}

export default function DropdownLogoutButton() {
  return (
    <form action={logoutAction}>
      <LogoutButton />
    </form>
  );
}
