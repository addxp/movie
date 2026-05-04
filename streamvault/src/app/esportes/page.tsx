import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import EsportesClient from "@/components/esportes/EsportesClient";

export const revalidate = 60; // atualiza a cada 60 segundos

async function getEventos() {
  try {
    const res = await fetch("https://superflixapi.online/lista?category=eventos&format=json", {
      next: { revalidate: 60 }
    });
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export default async function EsportesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const eventos = await getEventos();

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar user={user} />
      <EsportesClient eventos={eventos} />
    </div>
  );
}