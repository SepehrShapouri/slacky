import api from "@/lib/ky";
import { Channels } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function useDeleteChannel() {
  const queryClient = useQueryClient();
  const {
    mutate: deleteChannel,
    isPending: isDeletingChannel,
    isError,
    error: deleteWorkspaceError,
  } = useMutation({
    mutationKey: ["delete-channel"],
    mutationFn: (data: { workspaceId: string; channelId: string }) =>
      api
        .delete(`/api/channels/${data.workspaceId}/${data.channelId}`)
        .json<Channels | null | undefined>(),
    onSuccess: (channel) => {
      queryClient.invalidateQueries({
        queryKey: ["channels", channel?.workspaceId],
      });
      queryClient.refetchQueries({
        queryKey: ["channels", channel?.workspaceId],
      });
    },
  });
  return {
    deleteChannel,
    isDeletingChannel,
    deleteWorkspaceError,
  };
}

export default useDeleteChannel;
