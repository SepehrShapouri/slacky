import { Channels, Member } from "@prisma/client";
export type Message = {
  id: string;
  body: string;
  createdAt: string;
  member: { id: number; user: { name: string; avatarUrl: string } };
  channel: { id: string; name: string } | null;
};
export type SearchResult = {
  channels?: Channels[];
  members?: Member[];
  messages?: Message[];
};
