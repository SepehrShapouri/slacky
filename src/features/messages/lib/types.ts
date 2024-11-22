import { $Enums, Member, Reactions } from "@prisma/client";

export type ModifiedMessage = {
  workspaceId: string;
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
  channelId?: string | null;
  body: string;
  attachments: string[];
  memberId: number;
  conversationId?: string | null;
  parentId: string | null;
  key?: string;
  isPending?: boolean;
  replies?:ModifiedMessage[],
  member?: {
    id: number;
    role: $Enums.Role;
    joinedAt: Date;
    userId: number;
    workspaceId: string;
    user: {
      avatarUrl?: string;
      fullname: string;
      email: string;
    };
  };
  userId?: number;
  reactions: ReactionType[] | [];
};
export type ReactionType = Reactions & {
  member: { user: { fullname: string; avatarUrl: string } };
};

// attachments
// body
// channelId
// createdAt
// id
// member
// memberId
// parentId
// updatedAt
// workspaceId
