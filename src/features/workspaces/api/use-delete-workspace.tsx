import api from "@/lib/ky";
import { Workspaces } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import React, { useMemo } from "react";
import { useGetWorkspaces } from "./use-get-workspaces";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function useDeleteWorkspace() {
  const {
    mutate: deleteWorkspace,
    isPending: isDeletingWorkspace,
    isError,
    error: deleteWorkspaceError,
  } = useMutation({
    mutationKey: ["delete-workspace"],
    mutationFn: (data: { workspaceId: string }) =>
      api
        .delete(`/api/workspaces/${data.workspaceId}`)
        .json<Workspaces | null | undefined>(),
  });
  return {
    deleteWorkspace,
    isDeletingWorkspace,
    deleteWorkspaceError,
  };
}

export default useDeleteWorkspace;
