import api from "@/lib/ky";
import { Channels } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import React from "react";
type useGetChannelsProps = {
  workspaceId: string;
};
function useGetChannels({ workspaceId }: useGetChannelsProps) {
  const { data: channels, isLoading: isChannelsLoading } = useQuery({
    queryKey: ["channels", workspaceId],
    queryFn: () => api.get(`/api/channels/${workspaceId}`).json<Channels[]>(),
  });

  return { channels, isChannelsLoading };
}

export default useGetChannels;
