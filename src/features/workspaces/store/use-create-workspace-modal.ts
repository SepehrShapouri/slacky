import { atom, useAtom } from "jotai";

const modalState = atom(false);
export const useCreateWorkspaceModalAtom = () => {
  return useAtom(modalState);
};
