import React from "react";
import { Message } from "ai/react";
import { cn } from "@/lib/utils";
type Props = {
  messages: Message[];
};

const MessageList = ({ messages }: Props) => {
  if (!messages) {
    return <></>;
  }

  return (
    <div className="flex flex-col gap-2 px-4">
      {/* for each message, return a div */}
      {messages.map((message) => {
        return (
          <div
            key={message.id}
            className={cn("flex", {
              // if the message is from the user, justify the message to the end of the screen
              "justify-end": message.role === "user",
              "justify-start": message.role === "assistant",
            })}
          >
            <div
              className={cn(
                "rounded-lg px-3 text-sm py-1 shadow-md ring-1 ring-gray-900/10",
                {
                  "bg-blue-600 text-white": message.role === "user",
                }
              )}
            >
              <p>{message.content}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;
