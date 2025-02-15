// import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs";
// import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { StickyNote } from "lucide-react";

export default function Home() {
  const { userId } = auth();

  if (userId) redirect("/notes");

  return (
    <main className="flex h-screen flex-col items-center justify-center gap-5">
      <div className="flex items-center gap-4">
        {/* <Image src={logo} alt="AI Notes logo" width={100} height={100} /> */}
        <StickyNote className="h-16 w-16" />
        <span className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Code x AI-Notes
        </span>
      </div>
      <p className="max-w-prose text-center">
        An intelligent note-taking app with AI integration, built with Open
        Source LLMs, Pinecone, Next.js, Shadcn UI, Clerk, and more.
      </p>
      <Button size="lg" asChild>
        <Link href="/notes">Open</Link>
      </Button>
    </main>
  );
}
