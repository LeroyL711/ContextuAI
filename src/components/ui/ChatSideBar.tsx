import { DrizzleChat } from '@/lib/db/schema'
import React from 'react'

type Props = {
    chats: DrizzleChat[],
    chatId: number,
}

const ChatSideBar = (props: Props) => {
  return (
    <div>ChatSideBar</div>
  )
}

export default ChatSideBar