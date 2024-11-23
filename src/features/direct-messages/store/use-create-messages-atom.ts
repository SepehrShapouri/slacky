import { ModifiedMessage } from "@/features/messages/lib/types";
import { atom, useAtom } from "jotai";


const messagesState = atom<ModifiedMessage[]>([]);
export const useCreateMessagesAtom = () => {
  return useAtom(messagesState);
};
