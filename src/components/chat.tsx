"use client";

import React, { useEffect, useState } from "react";
import { useSocket } from "@/hooks/use-socket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useChannelId } from "@/hooks/use-channel-id";
import { useGetMessages } from "@/features/channels/api/use-get-channel-messages";
import { UploadButton } from "@/lib/uploadthing";
import "@uploadthing/react/styles.css";

interface Message {
  id: string;
  body: string;
  memberId: number;
  workspaceId: string;
  channelId: string;
}

export default function ChatComponent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const workspaceId = useWorkspaceId();
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>();
  const channelId = useChannelId();
  const { member } = useCurrentMember({ workspaceId });
  const socket = useSocket("channels"); // Use the 'channels' namespace
  const { messages: initialMessages, isMessagesLoading } = useGetMessages({
    workspaceId,
    channelId,
  });
  useEffect(() => {
    if (isMessagesLoading) return;
    console.log(initialMessages);
    if (!initialMessages) return;
    const formattedMessages: Message[] = initialMessages.map((item) => ({
      body: item.body,
      channelId: item.channelId!,
      id: item.id,
      memberId: item.memberId,
      workspaceId: item.workspaceId,
    }));
    setMessages(formattedMessages);
    console.log(formattedMessages);
  }, [initialMessages, setMessages, isMessagesLoading]);

  useEffect(() => {
    if (socket && channelId) {
      // Join the channel
      socket.emit("join-room", channelId);

      // Listen for new messages
      socket.on("new-message", (message: Message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      // Error handling
      socket.on("error", (error: string) => {
        console.error("Socket error:", error);
        // You might want to show this error to the user
      });
    }

    // Cleanup function
    return () => {
      if (socket) {
        socket.off("new-message");
        socket.off("error");
        socket.emit("leave-room", channelId); // Add this to leave the room when unmounting
      }
    };
  }, [socket, channelId]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (socket && inputMessage.trim() && member && workspaceId && channelId) {
      const newMessage = {
        body: inputMessage,
        memberId: member.id,
        workspaceId: workspaceId,
        channelId: channelId,
        userId: member.userId,
        imageUrl:uploadedImageUrl
      };
      socket.emit("send-message", newMessage);
      setInputMessage("");
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-md mx-auto border rounded-lg overflow-hidden">
      <ScrollArea className="flex-grow p-4">
        {messages.map((message) => (
          <div key={message.id} className="mb-2 p-2 bg-gray-100 rounded">
            <span className="font-bold">User {message.memberId}: </span>
            {message.body}
          </div>
        ))}
      </ScrollArea>
      <form onSubmit={sendMessage} className="p-4 bg-gray-200 flex">
        <Input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow mr-2"
        />
        <UploadButton endpoint="attachment" onClientUploadComplete={(res)=>{
          setUploadedImageUrl(res[0].url)
        }} onUploadError={(error:Error)=>console.log(error)}/>
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
}
