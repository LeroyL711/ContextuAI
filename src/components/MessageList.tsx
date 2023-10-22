import React from "react";
import { Message } from "ai/react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
type Props = {
  isLoading?: boolean;
  messages: Message[];
};

const MessageList = ({ isLoading, messages }: Props) => {
  if (isLoading){
    return (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    )
  }
  if (!messages) {
    return <></>;
  }

  return (
    <div className="flex flex-col gap-2 p-4">
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
                "rounded-lg px-3 text-sm py-1 shadow-sm ring-1 ring-gray-900/10 dark:bg-gray-700",
                {
                  "bg-blue-600 text-white dark:bg-blue-700": message.role === "user",
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
