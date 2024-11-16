import { atom, useAtom } from "jotai";
type OnlineUser =  {
    memberId: number;
    userId: number;
  }
const onlineUsersState = atom<OnlineUser[]>([]);
export const useCreateOnlineUsersAtom = () => {
  return useAtom(onlineUsersState);
};
