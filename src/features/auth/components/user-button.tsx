"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@prisma/client";
import { LogOut } from "lucide-react";
import { logoutAction } from "../actions";
import DropdownLogoutButton from "@/components/dropdown-logout";

export const UserButton = ({ user }: { user: User }) => {
  const { fullname, avatarUrl, email } = user;
  const avatarFallback = fullname.charAt(0).toUpperCase();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="outline-none relative">
        <Avatar className="size-9 hover:opacity-75 transition rounded-lg">
          <AvatarImage alt={fullname} src={avatarUrl || undefined} />
          <AvatarFallback className="bg-sky-500 font-semibold text-white rounded-lg">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" side="right" className="w-60 mb-2">
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={avatarUrl || undefined} alt={fullname} />
              <AvatarFallback className="rounded-lg font-semibold bg-sky-500 text-white">
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{fullname}</span>
              <span className="truncate text-xs">{email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownLogoutButton/>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
