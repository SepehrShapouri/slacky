import { useQueryState } from "nuqs";
export const useSearchQuery = () => {
  return useQueryState("query");
};
