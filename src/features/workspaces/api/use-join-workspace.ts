import api from "@/lib/ky";
import { Member, Workspaces } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { HTTPError } from "ky";
import { toast } from "sonner";

export function useJoinWorkspace() {
  const { mutate: joinWorkspace, isPending: isJoiningWorkspace,error} = useMutation({
    mutationFn: (data: { workspaceId: string; joinCode: string }) =>
      api
        .post(`/api/workspaces/${data.workspaceId}/join`, {
          json: {joinCode:data.joinCode},
        })
        .json<{ newMember: Member; workspace: Workspaces }>(),

    onError: async (err) => {
        if(err instanceof HTTPError){
            const errorData = await err.response.json().catch(()=>({}))
            toast.error(errorData.error)
        }
    }
  });
  return { joinWorkspace, isJoiningWorkspace };
}
