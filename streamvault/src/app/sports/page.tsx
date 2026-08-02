import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { Trophy } from "lucide-react";

interface Match {
  id: number;
  homeTeam: { name: string; crest: string };
  awayTeam: { name: string; crest: string };
  score: {
    fullTime: { home: number | null; away: number | null };
  };
  status: string;
  utcDate: string;
  competition: { name: string; emblem: string };
}

async function getLiveMatches(): Promise<Match[]> {
  try {
    const res = await fetch(
      "https://api.football-data.org/v4/matches?status=LIVE,IN_PLAY,PAUSED",
      {
        headers: { "X-Auth-Token": process.env.FOOTBALL_API_KEY || "" },
        next: { revalidate: 60 }, // Atualiza a cada 60 segundos
      }
    );
    const data = await res.json();
    return data.matches || [];
  } catch {
    return [];
  }
}

async function getTodayMatches(): Promise<Match[]> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const res = await fetch(
      `https://api.football-data.org/v4/matches?dateFrom=${today}&dateTo=${today}`,
      {
        headers: { "X-Auth-Token": process.env.FOOTBALL_API_KEY || "" },
        next: { revalidate: 300 },
      }
    );
    const data = await res.json();
    return data.matches || [];
  } catch {
    return [];
  }
}

function getStatusLabel(status: string) {
  const map: Record<string, { label: string; color: string }> = {
    IN_PLAY: { label: "AO VIVO", color: "text-green-400 bg-green-400/20 border-green-400/30" },
    PAUSED: { label: "INTERVALO", color: "text-yellow-400 bg-yellow-400/20 border-yellow-400/30" },
    LIVE: { label: "AO VIVO", color: "text-green-400 bg-green-400/20 border-green-400/30" },
    FINISHED: { label: "ENCERRADO", color: "text-gray-400 bg-gray-400/20 border-gray-400/30" },
    SCHEDULED: { label: "AGENDADO", color: "text-blue-400 bg-blue-400/20 border-blue-400/30" },
    TIMED: { label: "AGENDADO", color: "text-blue-400 bg-blue-400/20 border-blue-400/30" },
  };
  return map[status] || { label: status, color: "text-gray-400 bg-gray-400/20 border-gray-400/30" };
}

function formatTime(utcDate: string) {
  return new Date(utcDate).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
}

export default async function SportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [liveMatches, todayMatches] = await Promise.all([
    getLiveMatches(),
    getTodayMatches(),
  ]);

  const scheduledMatches = todayMatches.filter(
    (m) => m.status === "SCHEDULED" || m.status === "TIMED"
  );
  const finishedMatches = todayMatches.filter((m) => m.status === "FINISHED");

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar user={user} />
      <div className="pt-24 pb-16 px-6 lg:px-16 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Trophy size={28} className="text-green-400" />
          <h1 className="text-4xl text-white" style={{ fontFamily: "var(--font-display)" }}>
            FUTEBOL AO VIVO
          </h1>
          <span className="text-xs text-green-400 bg-green-400/20 border border-green-400/30 px-2 py-1 rounded animate-pulse">
            LIVE
          </span>
        </div>

        {/* Jogos ao vivo */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
            Ao Vivo ({liveMatches.length})
          </h2>
          {liveMatches.length === 0 ? (
            <div className="bg-[var(--color-card)] rounded-xl p-8 border border-white/5 text-center text-[var(--color-muted)]">
              Nenhum jogo ao vivo no momento
            </div>
          ) : (
            <div className="space-y-3">
              {liveMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          )}
        </section>

        {/* Jogos de hoje agendados */}
        {scheduledMatches.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-white mb-4">
              Hoje — Próximos Jogos ({scheduledMatches.length})
            </h2>
            <div className="space-y-3">
              {scheduledMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </section>
        )}

        {/* Jogos encerrados hoje */}
        {finishedMatches.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              Encerrados Hoje ({finishedMatches.length})
            </h2>
            <div className="space-y-3">
              {finishedMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function MatchCard({ match }: { match: Match }) {
  const status = getStatusLabel(match.status);
  const isLive = match.status === "IN_PLAY" || match.status === "LIVE" || match.status === "PAUSED";
  const homeScore = match.score.fullTime.home;
  const awayScore = match.score.fullTime.away;

  return (
    <div className={`bg-[var(--color-card)] rounded-xl p-4 border transition-all ${isLive ? "border-green-400/30 shadow-lg shadow-green-400/5" : "border-white/5"}`}>
      {/* Competição */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[var(--color-muted)] text-xs flex items-center gap-1.5">
          {match.competition.emblem && (
            <img src={match.competition.emblem} alt="" className="w-4 h-4 object-contain" />
          )}
          {match.competition.name}
        </span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${status.color}`}>
          {status.label}
        </span>
      </div>

      {/* Placar */}
      <div className="flex items-center justify-between gap-4">
        {/* Time da casa */}
        <div className="flex items-center gap-3 flex-1">
          {match.homeTeam.crest && (
            <img src={match.homeTeam.crest} alt="" className="w-10 h-10 object-contain" />
          )}
          <span className="text-white font-semibold text-sm md:text-base">
            {match.homeTeam.name}
          </span>
        </div>

        {/* Placar ou horário */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {homeScore !== null ? (
            <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-lg">
              <span className={`text-2xl font-bold ${isLive ? "text-green-400" : "text-white"}`}>
                {homeScore}
              </span>
              <span className="text-[var(--color-muted)]">—</span>
              <span className={`text-2xl font-bold ${isLive ? "text-green-400" : "text-white"}`}>
                {awayScore}
              </span>
            </div>
          ) : (
            <div className="bg-black/40 px-4 py-2 rounded-lg">
              <span className="text-blue-400 font-bold text-lg">
                {formatTime(match.utcDate)}
              </span>
            </div>
          )}
        </div>

        {/* Time visitante */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          <span className="text-white font-semibold text-sm md:text-base text-right">
            {match.awayTeam.name}
          </span>
          {match.awayTeam.crest && (
            <img src={match.awayTeam.crest} alt="" className="w-10 h-10 object-contain" />
          )}
        </div>
      </div>
    </div>
  );
}