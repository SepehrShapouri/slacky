export function generateConversationKey(id1: number, id2: number): string {
  const sortedIds = [Number(id1), Number(id2)].sort((a, b) => a - b);

  return sortedIds.join("_");
}
