import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import useSingleMember from "@/hooks/use-single-member";
import { AlertTriangle, Loader2, MailIcon, XIcon } from "lucide-react";
import Link from "next/link";
import React from "react";
type ProfileProps = {
  onClose: () => void;
  profileMemberId: string;
};
function Profile({ onClose, profileMemberId }: ProfileProps) {
  const { isMemberLoading, member } = useSingleMember({
    memberId: Number(profileMemberId),
  });

  if (isMemberLoading)
    return (
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center h-[49px] shrink-0 px-4 border-b">
          <p className="text-lg font-bold">Profile</p>
          <Button onClick={onClose} size="iconSm" variant="ghost">
            <XIcon className="size-5 stroke-1.5" />
          </Button>
        </div>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  if (!member)
    return (
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center h-[49px] shrink-0 px-4 border-b">
          <p className="text-lg font-bold">Profile</p>
          <Button onClick={onClose} size="iconSm" variant="ghost">
            <XIcon className="size-5 stroke-1.5" />
          </Button>
        </div>
        <div className="flex flex-col gap-y-1.5 items-center justify-center h-full">
          <AlertTriangle className="size-5  text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Member not found</p>
        </div>
      </div>
    );

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center h-[49px] shrink-0 px-4 border-b">
        <p className="text-lg font-bold">Profile</p>
        <Button onClick={onClose} size="iconSm" variant="ghost">
          <XIcon className="size-5 stroke-1.5" />
        </Button>
      </div>
      <div className="flex flex-col  items-center justify-center p-4">
        <Avatar className="rounded-lg max-w-[256px] max-h-[256px] size-full">
          <AvatarImage
            className="rounded-lg"
            src={member.user.avatarUrl || undefined}
          />
          <AvatarFallback className="bg-sky-500 text-white text-6xl font-extrabold rounded-lg aspect-square">
            {member.user.fullname[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex flex-col p-4">
        <p className="text-xl font-bold capitalize">{member.user.fullname}</p>
      </div>
      <Separator />
      <div className="flex flex-col p-4">
        <p className="text-sm font-bold mb-4">Contact information</p>
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-md bg-muted flex items-center justify-center">
            <MailIcon className="size-4" />
          </div>
          <div className="flex flex-col">
            <p className="text-[13px] font-semibold text-muted-foreground">
              Email address
            </p>
            <Link
              className="text-sm hover:underline text-[#1264a3]"
              href={`mailto:${member.user.email}`}
            >
              {member.user.email}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
