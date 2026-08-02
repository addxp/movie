"use client";
import { useState } from "react";
import Image from "next/image";
import { Trash2, Loader2, Tv } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Channel {
  id: string;
  name: string;
  logo: string;
  stream_url: string;
  category: string;
}

export default function AdminChannelList({ channels }: { channels: Channel[] }) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este canal?")) return;
    setDeleting(id);
    await supabase.from("channels").delete().eq("id", id);
    router.refresh();
    setDeleting(null);
  };

  if (!channels.length) return (
    <p className="text-[var(--color-muted)] text-sm py-8 text-center">Nenhum canal cadastrado.</p>
  );

  return (
    <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
      {channels.map((channel) => (
        <div key={channel.id} className="flex items-center gap-3 bg-[var(--color-card)] rounded-lg p-3 border border-white/5 hover:border-white/10 transition-colors group">
          <div className="relative w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden bg-black/40 flex items-center justify-center">
            {channel.logo ? (
              <Image src={channel.logo} alt={channel.name} fill className="object-contain p-1" unoptimized />
            ) : (
              <Tv size={16} className="text-[var(--color-muted)]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{channel.name}</p>
            <p className="text-[var(--color-muted)] text-xs">{channel.category}</p>
          </div>
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 text-xs">AO VIVO</span>
          </div>
          <button onClick={() => handleDelete(channel.id)} disabled={deleting === channel.id} className="text-[var(--color-muted)] hover:text-red-400 transition-colors p-2 opacity-0 group-hover:opacity-100">
            {deleting === channel.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          </button>
        </div>
      ))}
    </div>
  );
}