import api from "@/lib/ky";
import { Workspaces } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

export function useGetWorkspaces() {
  const { data: workspaces, isLoading } = useQuery({
    queryKey: ["workspaces", "all"],
    queryFn: () => api.get("/api/workspaces").json<Workspaces[] | undefined>(),
  });
  return { workspaces, isLoading };
}
