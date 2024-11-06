import { $Enums, Member } from "@prisma/client";

export type ModifiedMessage = {
  workspaceId: string;
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
  channelId: string | null;
  body: string;
  attachments: string[];
  memberId: number;
  conversationId: string | null;
  parentId: string | null;
  key?: string;
  isPending?: boolean;
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
  reactions?: any;
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
