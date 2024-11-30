import { Channels, Member } from "@prisma/client";
export type Message = {
  member: {
    id: number;
    user: {
      id: number;
      fullname: string;
      email: string | null;
      avatarUrl: string | null;
    };
  };
  body: string;
  channelId: string | null;
  conversationId: string | null;
  id:string
};
export type SearchResult = {
  channels?: Channels[];
  members?: Member[];
  messages?: Message[];
};
