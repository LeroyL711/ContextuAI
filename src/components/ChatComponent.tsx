"use client";
import React from "react";
import { Input } from "./ui/input";
import { useChat } from "ai/react";
import { Button } from "./ui/button";
import { Send } from "lucide-react";

type Props = {};

const ChatComponent = (props: Props) => {
  const { input, handleInputChange, handleSubmit, messages } = useChat();
  return (
    <div className="relative max-h-screen overflow-scroll">
      {/* header */}
      <div className="sticky top-0 inset-x-0 p-2 bg-white h-fit">
        <h3 className="text-xl font-bold">Chat COmponent</h3>
      </div>
        {/* messages */}
      <form onSubmit={handleSubmit} className="sticky bottom-0 inset-x-0 px-2 py-4 bg-white">
        <Input value={input} onChange={handleInputChange} placeholder="Ask any question..." className="w-full"></Input>
        <Button className="bg-blue-600 ml-2">
            <Send className="w-4 h-4"/>
        </Button>
      </form>
    </div>
  );
};

export default ChatComponent;
