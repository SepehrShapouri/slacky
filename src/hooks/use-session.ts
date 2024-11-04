import api from "@/lib/ky";
import { Session, User } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

export default function useSession() {
  const { data, isLoading } = useQuery({
    queryKey: ["authenticated-user"],
    queryFn: () =>
      api
        .get("/api/auth/current-user")
        .json<{ user: User | null; session: Session | null }>(),
        initialData:{user:null,session:null}
  });
  const {user,session} = data
  return { user,session };
}
