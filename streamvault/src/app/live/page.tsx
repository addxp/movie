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
    <div className="zone-vhs min-h-screen bg-[var(--bg)]">
      <Navbar user={user} />
      <div className="pt-24 pb-16 px-6 lg:px-16 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Radio size={28} className="text-[var(--red)]" />
          <h1 className="text-4xl text-[var(--text)]" style={{ fontFamily: "var(--font-display)" }}>
            CANAIS AO VIVO
          </h1>
          <span className="live-rec text-xs text-[var(--red-2)] bg-[var(--red-dim)] border border-[var(--red-border)] px-2 py-1 rounded font-bold font-mono uppercase tracking-wider">
            REC
          </span>
        </div>
        <LiveChannels channels={channels || []} />
      </div>
    </div>
  );
}