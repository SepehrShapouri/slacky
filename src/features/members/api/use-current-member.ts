import api from "@/lib/ky";
import { Member, User } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
type useCurrentMemberProps = {
  workspaceId: string;
};
type useCurrentMemberReturn = Member & {
  user: User;
};
export function useCurrentMember({ workspaceId }: useCurrentMemberProps) {
  const { data: member ,isLoading:isMemberLoading,error,isError} = useQuery({
    queryKey: ["current-member", workspaceId],
    queryFn: () =>
      api
        .get(`/api/workspaces/${workspaceId}/members/current`)
        .json<useCurrentMemberReturn | undefined | null>(),
  });
  return { member,isMemberLoading,error,isError}
}
