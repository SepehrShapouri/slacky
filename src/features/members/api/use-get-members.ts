type useGetMembersProps = {
  workspaceId: string;
};
type useGetMembersReturn = Member & {
  user: User;
};
import api from "@/lib/ky";
import { Member, Prisma, User } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import React from "react";

function useGetMembers({ workspaceId }: useGetMembersProps) {
  const { data: members, isLoading: isMembersLoading } = useQuery({
    queryKey: ["members", workspaceId],
    queryFn: () => api.get(`/api/workspaces/${workspaceId}/members`).json<useGetMembersReturn[]>(),
  });
  return { members, isMembersLoading };
}

export default useGetMembers;
