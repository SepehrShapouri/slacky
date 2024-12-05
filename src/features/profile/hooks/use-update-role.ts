import { useMemberReturn } from "@/hooks/use-single-member";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import api from "@/lib/ky";
import { Member, Role } from "@prisma/client";
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUpdateRole() {
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();

  const { mutate: updateRole, isPending: isUpdatingRole } = useMutation({
    mutationKey: ["update-role"],
    mutationFn: ({ memberId, role }: { memberId: string; role: Role }) =>
      api
        .patch(`/api/workspaces/${workspaceId}/members/${memberId}`, {
          json: { role },
        })
        .json<useMemberReturn | null>(),
    onMutate: async ({ memberId, role }) => {
      const queryKey: QueryKey = ["single-member", Number(memberId)];

      await queryClient.cancelQueries({ queryKey });

      const previousMember =
        queryClient.getQueryData<useMemberReturn>(queryKey);

      queryClient.setQueryData<useMemberReturn>(queryKey, (old) => {
        if (!old) return undefined;
        return { ...old, role };
      });

      console.log("Previous member data:", previousMember);

      return { previousMember };
    },
    onError: (err, newData, context) => {
      if (context?.previousMember) {
        const queryKey: QueryKey = ["single-member", context.previousMember.id];
        queryClient.setQueryData<useMemberReturn>(
          queryKey,
          context.previousMember
        );
      }
      toast.error("Failed to update role")
    },
    onSettled: (data, error, variables) => {
      if (data) {
        const queryKey: QueryKey = ["single-member", data.id];
        queryClient.invalidateQueries({ queryKey });
        queryClient.refetchQueries({queryKey})
        toast.success("Role updated")
      }
    },
  });

  return { updateRole, isUpdatingRole };
}
