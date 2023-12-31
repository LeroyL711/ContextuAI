"use client";
import React from "react";
import { Input } from "./ui/input";
import { useChat } from "ai/react";
import { Button } from "./ui/button";
import { Send } from "lucide-react";
import MessageList from "./MessageList";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Message } from "ai";

type Props = {chatId: number};

const ChatComponent = ({chatId}: Props) => {
    const { data, isLoading } = useQuery({
        queryKey: ["chat", chatId],
        queryFn: async () => {
            const res = await axios.post<Message[]>("/api/get-messages", {chatId});
            return res.data;
        },
    })

  // useChat is a custom hook that returns the input, handleInputChange, handleSubmit, and messages
  // it is imported from ai/react

  const { input, handleInputChange, handleSubmit, messages } = useChat({
    api: "/api/chat",
    body: {
        chatId,
    },
        initialMessages: data || [],
  });
  React.useEffect(() => {
    const messageContainer = document.getElementById("message-container");
    if (messageContainer){
        messageContainer.scrollTo({
            top: messageContainer.scrollHeight,
            behavior: "smooth",
        })
    }
  }, [messages]);
  return (
    <div className="relative max-h-screen overflow-auto" id="message-container">
      {/* header */}
      <div className="sticky top-0 inset-x-0 p-2 bg-white h-fit dark:bg-slate-800">
        <h3 className="text-xl font-bold ">Chat</h3>
      </div>
      {/* messages List*/}
      <MessageList messages={messages} isLoading={isLoading}/>
      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 inset-x-0 px-2 py-4 bg-white dark:bg-slate-800"
      >
        <div className="flex">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask any question..."
            className="w-full"
          />
          <Button className="bg-blue-600 ml-2 dark:text-white">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatComponent;
