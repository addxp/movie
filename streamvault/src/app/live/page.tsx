import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import LiveChannels from "@/components/live/LiveChannels";
import { Radio } from "lucide-react";

export default async function LivePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: channels } = await supabase
    .from("channels")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar user={user} />
      <div className="pt-24 pb-16 px-6 lg:px-16 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Radio size={28} className="text-[var(--color-red)]" />
          <h1 className="text-4xl text-white" style={{ fontFamily: "var(--font-display)" }}>
            CANAIS AO VIVO
          </h1>
          <span className="text-xs text-red-400 bg-red-400/20 border border-red-400/30 px-2 py-1 rounded animate-pulse font-bold">
            LIVE
          </span>
        </div>
        <LiveChannels channels={channels || []} />
      </div>
    </div>
  );
}