import api from "@/lib/ky";
import { Conversations } from "@prisma/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { generateConversationKey } from "../lib/utils";

type useFindOrCreateConversationProps = {
  workspaceId: string;
  memberOneId: number;
  memberTwoId: number;
};
export default function useFindOrCreateConversation({
  workspaceId,
  memberOneId,
  memberTwoId,
}: useFindOrCreateConversationProps) {
  const joinedMemberIds = generateConversationKey(memberOneId, memberTwoId);
  const { data: conversation, isLoading: isConversationloading } = useQuery({
    queryKey: ["conversation", workspaceId, memberOneId, memberTwoId],
    queryFn: () =>
      api
        .get(`/api/workspaces/${workspaceId}/conversations/${joinedMemberIds}`)
        .json<Conversations | null>(),
    enabled: !!memberOneId && !!memberTwoId,
  });
  return { conversation, isConversationloading };
}
