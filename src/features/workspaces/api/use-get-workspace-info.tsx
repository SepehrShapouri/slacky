import api from "@/lib/ky";
import { useQuery } from "@tanstack/react-query";

type useGetWorkspaceInfoProps = {
  workspaceId: string;
};
export default function useGetWorkspaceInfo({
  workspaceId,
}: useGetWorkspaceInfoProps) {
  const {data:workspaceInfo,isLoading:isWorkspaceInfoLoading} = useQuery({
    queryKey: ["workspace-info", workspaceId],
    queryFn: () =>
      api
        .get(`/api/workspaces/${workspaceId}/info`)
        .json<{ name: string; isMember: boolean }>(),
  });
  return{workspaceInfo,isWorkspaceInfoLoading}
}
