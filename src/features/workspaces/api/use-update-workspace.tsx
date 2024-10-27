import api from "@/lib/ky";
import { Workspaces } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateWorkspace() {
  const queryClient = useQueryClient();

  const {
    mutate: updateWorkspace,
    isPending: isUpdatingWorkspace,
    isError,
    error,
  } = useMutation({
    mutationKey: ["update-workspace"],
    mutationFn: (data: { name: string; workspaceId: string }) =>
      api
        .patch(`/api/workspaces/${data.workspaceId}`, {
          json: { name: data.name },
        })
        .json<Workspaces | null | undefined>(),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({
        queryKey: ["workspaces", newData.workspaceId],
      });

      const previousWorkspace = queryClient.getQueryData<Workspaces>([
        "workspaces",
        newData.workspaceId,
      ]);

      queryClient.setQueryData<Workspaces | undefined>(
        ["workspaces", newData.workspaceId],
        (old) => {
          if (!old) return undefined;
          return { ...old, name: newData.name };
        }
      );

      return { previousWorkspace };
    },
    onError: (err, newData, context) => {
      queryClient.setQueryData<Workspaces | undefined>(
        ["workspaces", newData.workspaceId],
        context?.previousWorkspace
      );
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["workspaces", variables.workspaceId],
      });
    },
  });

  return { updateWorkspace, isPending: isUpdatingWorkspace, error, isError };
}
