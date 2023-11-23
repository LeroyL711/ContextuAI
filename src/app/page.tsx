import { Button } from '@/components/ui/button'; // Button imported from shadCN
import { UserButton, auth } from '@clerk/nextjs';
import Link from 'next/link';
import { ArrowRight, LogIn } from 'lucide-react';
import FileUpload from '@/components/ui/FileUpload';
import { db } from '@/lib/db';
import { chats } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

// Adding in async makes so that this is a server component. This entire codeblock is going to run once on the server to generate HTML code.
// This HTML code is then sent back to the client and rendered. This is a good way to do things like fetch data from an API and then render it on the page.
export default async function Home() {
  const {userId} = await auth();
  const isAuth = !!userId;

  let firstChat;
  if (userId){
    firstChat = await db.select().from(chats).where(eq(chats.userId, userId));
    if (firstChat){
      firstChat = firstChat[0];
    }

  }
  return (
    <div className="w-screen min-h-screen bg-gradient-to-b from-sky-400 to-sky-200 dark:bg-gradient-to-t dark:from-blue-700 dark:via-blue-800 dark:to-gray-900">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center">
            <h1 className="m-3 text-5xl font-semibold">
              Gain insight on your PDFs
            </h1>
            <ThemeToggle className="mr-3"/>
            <UserButton afterSignOutUrl='/'/>
          </div>
        
          <div className="flex mt-2">
            {isAuth && firstChat && (
            <>
              <Link href={`/chat/${firstChat.id}`}>
              <Button>
                Go to Chats <ArrowRight className="ml-2"/>
              </Button>
              </Link>
            </>
            )}
          </div>
          <p className='max-w-xl mt-1 text-lg text-slate-800 dark:text-slate-400'>Upload your documents and let AI provide valuable insights, making information extraction and analysis a breeze.</p>
          <div className="w-full mt-4">
            {isAuth ? <FileUpload/> : (<Link href="/login"><Button>Login to get started! <LogIn className="w-4 h-4 ml-2"/></Button></Link>)}
          </div>
        </div>
      </div>
    </div>
  )
}
