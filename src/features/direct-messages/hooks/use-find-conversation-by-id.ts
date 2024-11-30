import { useWorkspaceId } from "@/hooks/use-workspace-id";
import api from "@/lib/ky";
import { Conversations } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

export default function useFindConversationById({
  conversationId,
}: {
  conversationId?: string;
}) {
  const workspaceId = useWorkspaceId();
  const { data: conversation, isLoading: isConversationLoading } = useQuery({
    queryKey: ["conversation-by-id", conversationId],
    queryFn: () =>
      api
        .get(
          `/api/workspaces/${workspaceId}/conversations/by_id/${conversationId}`
        )
        .json<Conversations>(),
        enabled:!!conversationId
  });
  return { conversation, isConversationLoading };
}
