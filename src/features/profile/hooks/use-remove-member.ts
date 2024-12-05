import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import api from "@/lib/ky";
import { Member, User } from "@prisma/client";
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
type useGetMembersReturn = Member & {
  user: User;
};
export function useRemoveMember() {
  const queryClient = useQueryClient();
  const { replace } = useRouter();
  const workspaceId = useWorkspaceId();
  const { member: currentMember } = useCurrentMember({ workspaceId });
  const queryKey: QueryKey = ["members", workspaceId];
  const { mutate: removeMember, isPending: isRemovingMember } = useMutation({
    mutationFn: ({ memberId }: { memberId: string }) =>
      api
        .delete(`/api/workspaces/${workspaceId}/members/${memberId}`)
        .json<Member>(),
    onSuccess: async (member) => {
      await queryClient.cancelQueries({ queryKey });
      const previousMembers =
        queryClient.getQueryData<useGetMembersReturn[]>(queryKey);
      queryClient.setQueryData<useGetMembersReturn[]>(queryKey, (old) => {
        if (!old) return [];
        return old.filter((prevMember) => prevMember.id != member.id);
      });
      return { previousMembers };
    },
  });
  return { removeMember, isRemovingMember };
}
