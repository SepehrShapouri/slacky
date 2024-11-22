import { ModifiedMessage } from "@/features/messages/lib/types";
import api from "@/lib/ky";
import { Messages } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

export function useGetMessages({
  workspaceId,
  conversationId,
}: {
  workspaceId: string;
  conversationId?: string;
}) {
  const { data: messages, isLoading: isMessagesLoading } = useQuery({
    queryKey: ["messages", conversationId, workspaceId],
    queryFn: () =>
      api
        .get(
          `/api/workspaces/${workspaceId}/conversations/messages/${conversationId}`
        )
        .json<ModifiedMessage[]>(),
    enabled: !!conversationId,
  });

  return { messages, isMessagesLoading };
}
