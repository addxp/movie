 
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

  const { data: allRequests } = await supabase
    .from("requests")
    .select("*, profiles:user_id(email)")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar user={user} />
      <div className="pt-24 pb-20 px-8 lg:px-16 max-w-5xl mx-auto">

        <div className="flex items-center gap-3 mb-8">
          <MessageSquarePlus size={28} className="text-[var(--color-red)]" />
          <h1 className="text-4xl text-white font-bold" style={{ fontFamily: "var(--font-display)" }}>
            PEDIDOS
          </h1>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
          {/* Lista de pedidos */}
          <div>
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              Pedidos da Comunidade
              <span className="text-[#555] text-xs bg-white/5 px-2 py-0.5 rounded-full">
                {allRequests?.length || 0}
              </span>
            </h2>
            <RequestList requests={allRequests || []} myUserId={user.id} />
          </div>

          {/* Formulário */}
          <div className="sticky top-24">
            <h2 className="text-white font-semibold mb-4">Fazer um Pedido</h2>
            <RequestForm userId={user.id} />

            {/* Meus pedidos */}
            {myRequests && myRequests.length > 0 && (
              <div className="mt-6">
                <h3 className="text-[#555] text-xs uppercase tracking-wider mb-3">Meus Pedidos</h3>
                <div className="space-y-2">
                  {myRequests.slice(0, 5).map((req) => (
                    <div key={req.id} className="bg-[var(--color-card)] rounded-lg p-3 border border-white/5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-white text-xs font-medium truncate">{req.title}</p>
                        <StatusBadge status={req.status} />
                      </div>
                      <p className="text-[#555] text-[10px] mt-1 capitalize">{req.type}</p>
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
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    approved: "bg-green-500/20 text-green-400 border-green-500/30",
    rejected: "bg-red-500/20 text-red-400 border-red-500/30",
    done: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  };
  const labels: Record<string, string> = {
    pending: "Pendente",
    approved: "Aprovado",
    rejected: "Negado",
    done: "Adicionado",
  };
  return (
    <span className={"text-[9px] font-bold px-1.5 py-0.5 rounded border " + (styles[status] || styles.pending)}>
      {labels[status] || "Pendente"}
    </span>
  );
}