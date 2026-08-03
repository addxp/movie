import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRoomByCode } from "@/lib/watchparty/room";
import { getProfileById } from "@/lib/profiles";
import Navbar from "@/components/layout/Navbar";
import GroupWatchRoom from "@/components/watchparty/GroupWatchRoom";

export default async function RoomPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const room = await getRoomByCode(supabase, code);
  if (!room) notFound();

  const profile = await getProfileById(user.id);
  const username = profile?.full_name || profile?.username || "Convidado";

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar user={user} />
      <div className="pt-24 px-4 sm:px-8 pb-16 max-w-6xl mx-auto">
        <GroupWatchRoom
          room={room}
          userId={user.id}
          username={username}
          siteUrl={process.env.NEXT_PUBLIC_SITE_URL || "https://movieon-addxpht.vercel.app"}
        />
      </div>
    </div>
  );
}
