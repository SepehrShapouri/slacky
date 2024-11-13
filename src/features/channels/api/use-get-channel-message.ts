import { ModifiedMessage } from "@/features/messages/lib/types";
import api from "@/lib/ky";
import { useQuery } from "@tanstack/react-query";

export default function useGetMessage({
  channelId,
  messageId,
  workspaceId,
}: {
  workspaceId: string;
  channelId: string;
  messageId: string;
}) {
  const { data: message, isLoading: isMessageLoading } = useQuery({
    queryKey: ["message", messageId],
    queryFn: () =>
      api
        .get(`/api/channels/${workspaceId}/${channelId}/messages/${messageId}`)
        .json<ModifiedMessage>(),
  });
  return { message, isMessageLoading };
}
