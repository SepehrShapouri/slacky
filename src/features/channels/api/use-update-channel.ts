import api from "@/lib/ky";
import { Channels, Workspaces } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateChannel() {
  const queryClient = useQueryClient();

  const {
    mutate: updateChannel,
    isPending: isUpdatingChannel,
    isError,
    error,
  } = useMutation({
    mutationKey: ["update-channel"],
    mutationFn: (data: {
      name: string;
      workspaceId: string;
      channelId: string;
    }) =>
      api
        .patch(`/api/channels/${data.workspaceId}/${data.channelId}`, {
          json: { name: data.name },
        })
        .json<Channels | null | undefined>(),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({
        queryKey: ["channel", newData.workspaceId, newData.channelId],
      });

      const previousWorkspace = queryClient.getQueryData<Channels>([
        "channel",
        newData.workspaceId,
        newData.channelId,
      ]);

      queryClient.setQueryData<Channels | undefined>(
        ["channel", newData.workspaceId, newData.channelId],
        (old) => {
          if (!old) return undefined;
          return { ...old, name: newData.name };
        }
      );

      return { previousWorkspace };
    },
    onError: (err, newData, context) => {
      queryClient.setQueryData<Channels | undefined>(
        ["channel", newData.workspaceId, newData.channelId],
        context?.previousWorkspace
      );
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["channel", variables.workspaceId, variables.channelId],
      });
      queryClient.invalidateQueries({
        queryKey: ["channels", variables.workspaceId],
      });
      queryClient.refetchQueries({
        queryKey: ["channels", variables.workspaceId],
      });
    },
  });

  return { updateChannel, isUpdatingChannel, error, isError };
}
