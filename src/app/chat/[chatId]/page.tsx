import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  params: {
    chatId: string;
  };
};

// async changes the component to a server component. This means that this code will run once on the server to generate HTML code.
const ChatPage = async ({ params: { chatId } }: Props) => {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/login");
  }

  // List of all chats where the userId is equal to the userId to whom the chats belong.
  const _chats = await db.select().from(chats).where(eq(chats.userId, userId));
  if (!_chats){
    return redirect("/");
  }
  if (!_chats.find(chat=> chat.id === parseInt(chatId))){
    return redirect("/");
  }


  return (
  <div className="flex max-h-screen overflow-scroll">{chatId}
    <div className="flex wi--full max-h-screen overflow-scroll">
        {/* Chat sidebar */}
        <div className="flex--[1] max-w-xs">
            {/* <ChatSideBar/> */}
        </div>
        {/* pdf viewer */}
        <div className = "max-h-screen p-4 overflow-scroll flex-[5]">
            {/* <PDFViewer/> */}
        </div>
        {/* Chat component */}
        <div className="flex-[3] border-1-4 border-1-slate-200">
            {/* <ChatComponent/> */}
        </div>
    </div>
  </div>
  );
};

export default ChatPage;
