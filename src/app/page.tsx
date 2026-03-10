import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-4xl font-bold mb-4">NeighbourHub</h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-lg">
        Your AI-powered community assistant. Discover local events, services,
        and connect with your neighbourhood.
      </p>
      <Link href="/login">
        <Button size="lg" variant="outline">
          Get Started
        </Button>
      </Link>
    </main>
  );
}
