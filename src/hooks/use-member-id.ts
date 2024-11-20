import { useParams } from "next/navigation";
export const useMemberId = () => {
  const params = useParams();
  return Number(params.memberId) as number
};
