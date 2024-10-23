import api from "@/lib/ky";
import { Workspaces } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";

export function useCreateWorkspace() {
  const {
    mutate: createWorkspace,
    isPending,
    isError,
    error,
    
  } = useMutation({
    mutationKey: ["create-workspace"],
    mutationFn: (data: { name: string }) =>
      api.post("/api/workspaces", { json: data }).json<Workspaces>(),
  });
  return { createWorkspace, isPending ,error,isError};
}
