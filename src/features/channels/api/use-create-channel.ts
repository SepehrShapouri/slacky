import api from "@/lib/ky";
import { Channels } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateChannel() {
  const queryClient = useQueryClient();

  const { mutate: createChannel, isPending: isCreatingChannel } = useMutation({
    mutationKey: ["create-channel"],
    mutationFn: (data: { name: string; workspaceId: string }) =>
      api
        .post(`/api/channels/${data.workspaceId}`, { json: data })
        .json<Channels>(),
    onMutate: async (newChannel) => {
      await queryClient.cancelQueries({
        queryKey: ["channels", newChannel.workspaceId],
      });

      const previousChannels = queryClient.getQueryData<Channels[]>([
        "channels",
        newChannel.workspaceId,
      ]);

      const optimisticChannel = {
        ...newChannel,
        id:
          "temp-id-" +
          Date.now() +
          "-" +
          Math.random().toString(36).substr(2, 9),
      };

      queryClient.setQueryData<Channels[]>(
        ["channels", newChannel.workspaceId],
        (old = []) => [...old, optimisticChannel]
      );

      return { previousChannels, optimisticChannel };
    },
    onError: (err, newChannel, context) => {
      queryClient.setQueryData(
        ["channels", newChannel.workspaceId],
        context?.previousChannels
      );
    },
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData<Channels[]>(
        ["channels", variables.workspaceId],
        (old = []) => {
          const filteredChannels = old.filter(
            (channel) => channel.id !== context?.optimisticChannel.id
          );
          return [...filteredChannels, data];
        }
      );
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["channels", variables.workspaceId],
      });
    },
  });
  return { createChannel, isCreatingChannel };
}
