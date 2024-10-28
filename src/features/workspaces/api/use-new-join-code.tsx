import api from "@/lib/ky";
import { Workspaces } from "@prisma/client";
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useNewJoinCode() {
  const queryClient = useQueryClient();
  const {
    mutate: generateNewJoinCode,
    isPending: isGeneratingJoinCode,
    isError,
    error,
  } = useMutation({
    mutationFn: (data: { workspaceId: string }) =>
      api
        .patch(`/api/workspaces/${data.workspaceId}/join-code/new`)
        .json<Workspaces>(),
    onMutate: async (data) => {
      const queryKey = ["workspaces", data.workspaceId];
      await queryClient.cancelQueries({ queryKey });
      const previousWorkspace = queryClient.getQueryData<Workspaces>(queryKey);

      if (previousWorkspace) {
        queryClient.setQueryData<Workspaces>(queryKey, {
          ...previousWorkspace,
          joinCode: "Updating...",
        });
      }

      return { previousWorkspace };
    },
    onSuccess: (newWorkspace, variables) => {
      const queryKey = ["workspaces", variables.workspaceId];
      queryClient.setQueryData(queryKey, newWorkspace);
      toast.success("Invite code re-generated.");
    },
    onError: (error, variables, context) => {
      const queryKey = ["workspaces", variables.workspaceId];
      queryClient.setQueryData(queryKey, context?.previousWorkspace);
      toast.error(
        "Something went wrong while generating a new code, please try again."
      );
    },
    onSettled: (newWorkspace, error, variables) => {
      const queryKey = ["workspaces", variables.workspaceId];
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    generateNewJoinCode,
    isGeneratingJoinCode,
    error,
    isError,
  };
}