import api from "@/lib/ky";
import { Workspaces } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";

function useDeleteWorkspace() {
  const {
    mutate: deleteWorkspace,
    isPending: isDeletingWorkspace,
    isError,
    error: deleteWorkspaceError,
  } = useMutation({
    mutationKey: ["delete-workspace"],
    mutationFn: (data: { workspaceId: string }) =>
      api
        .delete(`/api/workspaces/${data.workspaceId}`)
        .json<Workspaces | null | undefined>(),
  });
  return {
    deleteWorkspace,
    isDeletingWorkspace,
    deleteWorkspaceError,
  };
}

export default useDeleteWorkspace;
