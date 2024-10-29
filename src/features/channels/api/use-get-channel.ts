import api from "@/lib/ky";
import { Channels } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import React from "react";
type useGetChannelProps = {
  workspaceId: string;
  channelId: string;
};
function useGetChannel({ workspaceId, channelId }: useGetChannelProps) {
  const { data: channel, isLoading: isChannelLoading } = useQuery({
    queryKey: ["channel", workspaceId, channelId],
    queryFn: () =>
      api.get(`/api/channels/${workspaceId}/${channelId}`).json<Channels>(),
  });

  return { channel, isChannelLoading };
}

export default useGetChannel;
