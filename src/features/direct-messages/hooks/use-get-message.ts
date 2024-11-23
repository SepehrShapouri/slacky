import { ModifiedMessage } from "@/features/messages/lib/types";
import api from "@/lib/ky";
import { useQuery } from "@tanstack/react-query";

export default function useGetConvMessage({
  conversationId,
  messageId,
  workspaceId,
}: {
  workspaceId: string;
  conversationId?: string;
  messageId: string;
}) {
  const { data: message, isLoading: isMessageLoading } = useQuery({
    queryKey: ["message", messageId],
    queryFn: () =>
      api
        .get(
          `/api/workspaces/${workspaceId}/conversations/messages/${conversationId}/${messageId}`
        )
        .json<ModifiedMessage>(),
    enabled: !!conversationId,
  });
  return { message, isMessageLoading };
}
