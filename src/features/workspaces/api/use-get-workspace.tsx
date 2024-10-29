import api from "@/lib/ky";
import { Channels, Member, Workspaces } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
type useGetWorkspaceProps = {
  id: string;
};
type WorkspaceReturn = Workspaces & Member[] & Channels[]
export function useGetWorkspace({ id }: useGetWorkspaceProps) {
  const { data: workspace, isLoading,error } = useQuery({
    queryKey: ["workspaces", id],
    queryFn: () =>
      api.get(`/api/workspaces/${id}`).json<Workspaces | undefined | null>(),
  });
  
  return { workspace, isLoading,error };
}
