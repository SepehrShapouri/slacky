import api from "@/lib/ky";
import { Workspaces } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
type useGetWorkspaceProps = {
  id: string;
};
export function useGetWorkspace({ id }: useGetWorkspaceProps) {
  const { data: workspace, isLoading } = useQuery({
    queryKey: ["workspaces", id],
    queryFn: () =>
      api.get(`/api/workspaces/${id}`).json<Workspaces | undefined | null>(),
  });
  return { workspace, isLoading };
}
