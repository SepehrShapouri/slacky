import { atom, useAtom } from "jotai";

const modalState = atom(false);
export const useCreateChannelModalAtom = () => {
  return useAtom(modalState);
};
