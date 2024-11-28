export type SearchResult = {
  members: Array<{
    id: number;
    role: string;
    user: { id: number; name: string; email: string; avatarUrl: string };
  }>;
  channels: Array<{
    id: string;
    name: string;
    createdAt: string;
  }>;
  messages: Array<{
    id: string;
    body: string;
    createdAt: string;
    member: { id: number; user: { name: string; avatarUrl: string } };
    channel: { id: string; name: string } | null;
  }>;
};
