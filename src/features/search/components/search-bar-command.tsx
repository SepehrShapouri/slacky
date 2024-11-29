"use client";
import { useDebouncedCallback } from "use-debounce";
import {
  CreditCard,
  HashIcon,
  Loader2,
  Search,
  Settings,
  User,
} from "lucide-react";
import { MdClose } from "react-icons/md";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import useGetMembers from "@/features/members/api/use-get-members";
import { useChannelId } from "@/hooks/use-channel-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import Link from "next/link";
import { useEffect, useState, useRef, useCallback, memo } from "react";
import useGetChannels from "@/features/channels/api/use-get-channels";
import { useSearchQuery } from "../store/use-search-query";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/ky";
import { Message, SearchResult } from "../types";
import useDebounce from "@/hooks/use-debounce";
import { CommandLoading } from "cmdk";
import hljs from "highlight.js";
import dynamic from "next/dynamic";
const Renderer = dynamic(
  () => {
    hljs.configure({ languages: ["javascript", "html", "css"] });
    //@ts-ignore
    window.hljs = hljs;
    return import("@/features/messages/components/renderer");
  },
  { ssr: false }
);
type SearchBarCommandProps = {
  onClose: () => void;
};

export function SearchBarCommand({ onClose }: SearchBarCommandProps) {
  const [query, setQuery] = useState<string>();
  const debouncedQuery = useDebounce(query, 300);

  const workspaceId = useWorkspaceId();

  const { member: currentMember } = useCurrentMember({ workspaceId });
  const { members, isMembersLoading } = useGetMembers({ workspaceId });
  const { channels, isChannelsLoading } = useGetChannels({ workspaceId });
  const commandRef = useRef<HTMLDivElement>(null);
  const [searchResult, setSearchResult] = useState<SearchResult>();
  const {
    data: fetchedSearchResult,
    isLoading: isSearchResultLoading,
    isRefetching,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["query", debouncedQuery],
    queryFn: () =>
      api
        .get(`/api/search?q=${debouncedQuery}&workspaceId=${workspaceId}`)
        .json<Message[]>(),
    enabled: !!query,
  });
  useEffect(() => {
    if (isSearchResultLoading || isRefetching || isFetching) return;
    refetch();
  }, [debouncedQuery, refetch]);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        commandRef.current &&
        !commandRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);
  useEffect(() => {
    if (isChannelsLoading) return;
    if (isMembersLoading) return;
    setSearchResult({
      channels: channels || [],
      members: members || [],
    });
  }, [channels, members, isChannelsLoading, isMembersLoading, setSearchResult]);
  useEffect(() => {
    if (isSearchResultLoading) return;

    setSearchResult((prev) => ({ ...prev, messages: fetchedSearchResult }));
  }, [fetchedSearchResult, isSearchResultLoading]);

  return (
    <Command
      shouldFilter={isSearchResultLoading ? false : true}
      className="rounded-lg border shadow-md relative z-[9999]"
      ref={commandRef}
    >
      <div className="w-full relative">
        <CommandInput
          value={query || undefined}
          onValueChange={(query) => setQuery(query)}
          className="w-full"
          placeholder="Search for messages, replies, or anything..."
        />
        <Button
          size="iconSm"
          className="absolute right-1.5 hover:bg-muted top-1.5"
          variant="transparent"
          onClick={onClose}
        >
          <MdClose className="text-black" />
        </Button>
      </div>
      <CommandList className="z-[999]">
        {/* <CommandEmpty>No results found.</CommandEmpty> */}

        <CommandGroup heading="Users">
          {isMembersLoading && (
            <CommandItem>
              <div className="relative flex items-center gap-1.5">
                <Loader2 className="size-5 animate-spin" />
                <span className="text-sm truncate">Loading users...</span>
              </div>
            </CommandItem>
          )}
          {members?.map((member) => (
            <CommandItem key={member.id}>
              <Link
                href={`/workspace/${workspaceId}/member/${member.id}`}
                onClick={onClose}
                className="w-full"
              >
                <div className="relative flex items-center gap-1.5">
                  <Avatar className="size-5 rounded-md">
                    <AvatarImage
                      className="rounded-md"
                      src={member?.user?.avatarUrl || undefined}
                    />
                    <AvatarFallback className="rounded-md text-xs bg-sky-500 text-white font-semibold">
                      {member.user.fullname[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm truncate">
                    {member.user.fullname}
                  </span>
                  {member.id === currentMember?.id && (
                    <span className="text-muted-foreground text-xs">(you)</span>
                  )}
                  {true && (
                    <span className="flex items-center justify-center size-2 rounded-full bg-[#481349]">
                      <span className="size-1.5 bg-[#007a5a] rounded-full shrink-0" />
                    </span>
                  )}
                </div>
              </Link>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Channels">
          {isChannelsLoading && (
            <CommandItem>
              <div className="relative flex items-center gap-1.5">
                <Loader2 className="size-5 animate-spin" />
                <span className="text-sm truncate">Loading channels...</span>
              </div>
            </CommandItem>
          )}
          {channels?.map((channel) => {
            return (
              <CommandItem>
                <Link
                  href={`/workspace/${workspaceId}/channel/${channel.id}`}
                  className="flex items-center w-full"
                >
                  <HashIcon className="size-3.5 mr-1 shrink-0" />
                  <span className="text-sm truncate">{channel.name}</span>
                </Link>
              </CommandItem>
            );
          })}
        </CommandGroup>
        {isSearchResultLoading ||
          isRefetching ||
          (isFetching && (
            <CommandLoading className="text-muted-foreground text-xs p-2">
              Loading...
            </CommandLoading>
          ))}
        {fetchedSearchResult?.map((message) => {
          console.log(message,'message')
          return (
            <CommandItem key={message.id}>
              <Renderer value={message.body} />
            </CommandItem>
          );
        })}
      </CommandList>
    </Command>
  );
}