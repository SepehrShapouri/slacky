import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import useSingleMember from "@/hooks/use-single-member";
import {
  AlertTriangle,
  ChevronDown,
  Loader2,
  MailIcon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { useUpdateRole } from "../hooks/use-update-role";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useRemoveMember } from "../hooks/use-remove-member";
import { toast } from "sonner";
import { Role } from "@prisma/client";
import { useConfirm } from "@/hooks/use-confirm";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioItem,
  DropdownMenuRadioGroup,
} from "@/components/ui/dropdown-menu";
type ProfileProps = {
  onClose: () => void;
  profileMemberId: string;
};
function Profile({ onClose, profileMemberId }: ProfileProps) {
  const router = useRouter();
  const [LeaveDialog, confirmLeave] = useConfirm(
    "Are you sure you want to leave this workspace?",
    "This action is irreversible"
  );
  const [RemoveDialog, confirmRemove] = useConfirm(
    "Are you sure you want to remove this member?",
    "This action is irreversible"
  );
  const [UpdateDialog, confirmUpdate] = useConfirm(
    "Carefull",
    "Are you sure you want to change this member's role?"
  );
  const workspaceId = useWorkspaceId();
  const { isMemberLoading, member } = useSingleMember({
    memberId: Number(profileMemberId),
  });
  const { member: currentMember, isMemberLoading: isCurrentMemberLoading } =
    useCurrentMember({ workspaceId });
  const { updateRole, isUpdatingRole } = useUpdateRole();
  const { removeMember, isRemovingMember } = useRemoveMember();
  const onRemove = async () => {
    const ok = await confirmRemove();
    if (!ok) return;
    removeMember(
      { memberId: String(member?.id) },
      {
        onSuccess: () => {
          toast.success("Member removed");
          onClose();
        },
        onError: (err) => {
          toast.error("Failed to remove member");
        },
      }
    );
  };
  const onLeave = async () => {
    const ok = await confirmLeave();
    if (!ok) return;
    removeMember(
      { memberId: String(member?.id) },
      {
        onSuccess: () => {
          toast.success("You left the workspace");
          onClose();
          router.replace("/");
        },
        onError: (err) => {
          toast.error("Failed to leave workspace");
        },
      }
    );
  };
  const onUpdate = async (role: Role) => {
    const ok = await confirmUpdate();
    if (!ok) return;
    updateRole({ memberId: String(member?.id), role });
  };
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
    <>
      <RemoveDialog />
      <LeaveDialog />
      <UpdateDialog />
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
          {currentMember?.role == "ADMIN" && currentMember.id !== member.id ? (
            <div className=" items-center flex mt-4 gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full capitalize">
                    {member.role} <ChevronDown className="size-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuRadioGroup
                    defaultValue={member.role}
                    onValueChange={(role) => onUpdate(role as Role)}
                  >
                    <DropdownMenuRadioItem value="ADMIN">
                      Admin
                    </DropdownMenuRadioItem>

                    <DropdownMenuRadioItem value="MEMBER">
                      Member
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                disabled={isRemovingMember}
                variant="destructive"
                className="w-full"
                onClick={onRemove}
              >
                Remove
              </Button>
            </div>
          ) : currentMember?.id == member.id &&
            currentMember.role != "ADMIN" ? (
            <div className="mt-4 flex justify-end">
              <Button
                variant="destructive"
                className="w-full"
                onClick={onLeave}
              >
                Leave
              </Button>
            </div>
          ) : null}
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
    </>
  );
}

export default Profile;
