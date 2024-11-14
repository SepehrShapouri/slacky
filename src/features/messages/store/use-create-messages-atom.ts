import { atom, useAtom } from "jotai";
import { ModifiedMessage } from "../lib/types";

const messagesState = atom<ModifiedMessage[]>([]);
export const useCreateMessagesAtom = () => {
  return useAtom(messagesState);
};
