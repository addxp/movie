import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import RequestForm from "@/components/requests/RequestForm";
import RequestList from "@/components/requests/RequestList";
import { MessageSquarePlus } from "lucide-react";

export default async function RequestsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: myRequests } = await supabase
    .from("requests")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // ✅ removido join com profiles que quebrava o RLS
  const { data: allRequests } = await supabase
    .from("requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  const pendingCount = allRequests?.filter((r) => r.status === "pending").length ?? 0;

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar user={user} />

      <div className="pt-24 pb-20 px-6 lg:px-14 max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquarePlus size={22} className="text-[var(--color-red)]" />
            <h1
              className="text-5xl font-black text-white tracking-tight"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.01em" }}
            >
              PEDIDOS
            </h1>
          </div>
          <p className="text-white/30 text-sm ml-9">
            Sugira filmes, séries e animes para adicionar à plataforma.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">

          {/* ── Lista da comunidade ── */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold flex items-center gap-2.5">
                Pedidos da Comunidade
                {(allRequests?.length ?? 0) > 0 && (
                  <span className="text-[10px] font-bold bg-white/5 text-white/40 px-2 py-0.5 rounded-full border border-white/8">
                    {allRequests?.length}
                  </span>
                )}
              </h2>
              {pendingCount > 0 && (
                <span className="text-[10px] text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-full font-semibold">
                  {pendingCount} pendente{pendingCount > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <RequestList requests={allRequests || []} myUserId={user.id} />
          </div>

          {/* ── Sidebar: form + meus pedidos ── */}
          <div className="sticky top-24 space-y-6">
            <div>
              <h2 className="text-white font-semibold mb-4">Fazer um Pedido</h2>
              <RequestForm userId={user.id} />
            </div>

            {myRequests && myRequests.length > 0 && (
              <div>
                <h3 className="text-white/30 text-[11px] uppercase tracking-widest mb-3 font-semibold">
                  Meus Pedidos
                </h3>
                <div className="space-y-2">
                  {myRequests.slice(0, 5).map((req) => (
                    <div
                      key={req.id}
                      className="bg-[var(--color-card)] rounded-xl p-3.5 border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-white text-xs font-semibold truncate">{req.title}</p>
                        <StatusBadge status={req.status} />
                      </div>
                      <p className="text-white/25 text-[10px] mt-1 capitalize">{req.type}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending:  "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
    approved: "bg-green-500/15 text-green-400 border-green-500/25",
    rejected: "bg-red-500/15 text-red-400 border-red-500/25",
    done:     "bg-blue-500/15 text-blue-400 border-blue-500/25",
  };
  const labels: Record<string, string> = {
    pending:  "Pendente",
    approved: "Aprovado",
    rejected: "Negado",
    done:     "Adicionado ✓",
  };
  return (
    <span className={"text-[9px] font-bold px-1.5 py-0.5 rounded-md border flex-shrink-0 " + (styles[status] || styles.pending)}>
      {labels[status] || "Pendente"}
    </span>
  );
}