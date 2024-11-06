import { ModifiedMessage } from "@/features/messages/lib/types";
import api from "@/lib/ky";
import { Messages } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

export  function useGetMessages({
  workspaceId,
  channelId,
}: {
  workspaceId: string;
  channelId: string;
}) {
  const {data:messages,isLoading:isMessagesLoading} = useQuery({
    queryKey: ["messages", channelId, workspaceId],
    queryFn: () =>
      api
        .get(`/api/channels/${workspaceId}/${channelId}/messages`)
        .json<ModifiedMessage[]>(),
  });
  

  return{messages,isMessagesLoading}
}
