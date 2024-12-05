import { useQuery } from "@tanstack/react-query";
import { useMemberId } from "./use-member-id";
import { useWorkspaceId } from "./use-workspace-id";
import api from "@/lib/ky";
import { Member, User } from "@prisma/client";
export type useMemberReturn = Member & {
  user: User;
};
export default function useSingleMember({ memberId }: { memberId: number }) {
  const workspaceId = useWorkspaceId();
  const { data: member, isLoading: isMemberLoading } = useQuery({
    queryKey: ["single-member", memberId],
    queryFn: () =>
      api
        .get(`/api/workspaces/${workspaceId}/members/${memberId}`)
        .json<useMemberReturn | null>(),
  });
  return { member, isMemberLoading };
}
