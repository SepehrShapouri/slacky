"use client";

import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import useSession from "./use-session";

const SOCKET_SERVER_URL = "http://localhost:3000";

export const useSocket = (namespace: "channels" | "dms") => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { session } = useSession();

  useEffect(() => {
    if (!session) return; // Don't connect if there's no session

    const newSocket = io(`${SOCKET_SERVER_URL}/${namespace}`, {
      auth: {
        token: session.id, // Assuming the session contains the user ID as the token
      },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    newSocket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [namespace, session]);

  return socket;
};
