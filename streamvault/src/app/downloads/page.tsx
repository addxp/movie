"use client";
import { useState, useEffect, useRef } from "react";
import { Download, Trash2, Play, CheckCircle, XCircle, Loader2, HardDrive, WifiOff } from "lucide-react";

interface DownloadItem {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
  type: "filme" | "serie" | "anime";
  duration: string;
  size?: string;
  progress: number; // 0-100
  status: "pending" | "downloading" | "done" | "error";
  addedAt: number;
}

const STORAGE_KEY = "streamvault_downloads";

function loadDownloads(): DownloadItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveDownloads(items: DownloadItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "done" | "downloading">("all");
  const xhrRefs = useRef<Record<string, XMLHttpRequest>>({});

  useEffect(() => {
    setDownloads(loadDownloads());
  }, []);

  const updateItem = (id: string, patch: Partial<DownloadItem>) => {
    setDownloads((prev) => {
      const next = prev.map((d) => d.id === id ? { ...d, ...patch } : d);
      saveDownloads(next);
      return next;
    });
  };

  const startDownload = (item: DownloadItem) => {
    updateItem(item.id, { status: "downloading", progress: 0 });

    const xhr = new XMLHttpRequest();
    xhrRefs.current[item.id] = xhr;
    xhr.open("GET", item.videoUrl, true);
    xhr.responseType = "blob";

    xhr.onprogress = (e) => {
      if (e.lengthComputable) {
        const progress = Math.round((e.loaded / e.total) * 100);
        const size = (e.total / 1024 / 1024).toFixed(1) + " MB";
        updateItem(item.id, { progress, size });
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const blob = xhr.response as Blob;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = item.title + ".mp4";
        a.click();
        URL.revokeObjectURL(url);
        updateItem(item.id, { status: "done", progress: 100 });
      } else {
        updateItem(item.id, { status: "error" });
      }
      delete xhrRefs.current[item.id];
    };

    xhr.onerror = () => {
      updateItem(item.id, { status: "error" });
      delete xhrRefs.current[item.id];
    };

    xhr.send();
  };

  const cancelDownload = (id: string) => {
    xhrRefs.current[id]?.abort();
    delete xhrRefs.current[id];
    updateItem(id, { status: "pending", progress: 0 });
  };

  const removeDownload = (id: string) => {
    xhrRefs.current[id]?.abort();
    delete xhrRefs.current[id];
    setDownloads((prev) => {
      const next = prev.filter((d) => d.id !== id);
      saveDownloads(next);
      return next;
    });
  };

  const filtered = downloads.filter((d) => {
    if (activeTab === "done") return d.status === "done";
    if (activeTab === "downloading") return d.status === "downloading" || d.status === "pending";
    return true;
  });

  const doneCount = downloads.filter((d) => d.status === "done").length;
  const activeCount = downloads.filter((d) => d.status === "downloading").length;

  const statusIcon = (item: DownloadItem) => {
    if (item.status === "done") return <CheckCircle size={18} color="#22c55e" />;
    if (item.status === "error") return <XCircle size={18} color="#ef4444" />;
    if (item.status === "downloading") return <Loader2 size={18} color="var(--color-red)" className="animate-spin" />;
    return <Download size={18} color="rgba(255,255,255,0.4)" />;
  };

  return (
    <div className="min-h-screen pt-20 pb-24 px-4 max-w-2xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Downloads</h1>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
          Conteúdo salvo para assistir offline
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total", value: downloads.length },
          { label: "Concluídos", value: doneCount },
          { label: "Baixando", value: activeCount },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl p-3 text-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-xl font-bold text-white">{value}</p>
            <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {(["all", "done", "downloading"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="px-4 py-1.5 rounded-full text-sm transition-all"
            style={{
              background: activeTab === tab ? "var(--color-red)" : "rgba(255,255,255,0.06)",
              color: activeTab === tab ? "#fff" : "rgba(255,255,255,0.5)",
              border: "1px solid " + (activeTab === tab ? "var(--color-red)" : "rgba(255,255,255,0.08)"),
            }}>
            {tab === "all" ? "Todos" : tab === "done" ? "Concluídos" : "Em andamento"}
          </button>
        ))}
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          {activeTab === "downloading" ? (
            <>
              <Download size={40} color="rgba(255,255,255,0.15)" />
              <p className="text-sm text-center" style={{ color: "rgba(255,255,255,0.35)" }}>
                Nenhum download em andamento
              </p>
            </>
          ) : (
            <>
              <WifiOff size={40} color="rgba(255,255,255,0.15)" />
              <p className="text-sm text-center" style={{ color: "rgba(255,255,255,0.35)" }}>
                Nenhum conteúdo baixado ainda.<br />
                Toque em "Baixar" em qualquer filme ou episódio.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((item) => (
            <div key={item.id} className="rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-3 p-3">
                {/* Thumbnail */}
                <div className="w-16 h-24 rounded-lg overflow-hidden shrink-0 relative" style={{ background: "rgba(255,255,255,0.08)" }}>
                  {item.thumbnail && (
                    <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                  )}
                  {item.status === "done" && (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
                      <Play size={20} fill="white" color="white" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{item.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full capitalize"
                      style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
                      {item.type}
                    </span>
                    <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>{item.duration}</span>
                    {item.size && <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>{item.size}</span>}
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2 mt-2">
                    {statusIcon(item)}
                    <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>
                      {item.status === "done" && "Disponível offline"}
                      {item.status === "error" && "Erro no download"}
                      {item.status === "downloading" && `${item.progress}%`}
                      {item.status === "pending" && "Aguardando"}
                    </span>
                  </div>

                  {/* Barra de progresso */}
                  {item.status === "downloading" && (
                    <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                      <div className="h-full rounded-full transition-all duration-300" style={{ width: item.progress + "%", background: "var(--color-red)" }} />
                    </div>
                  )}
                </div>

                {/* Ações */}
                <div className="flex flex-col gap-2 shrink-0">
                  {item.status === "pending" && (
                    <button onClick={() => startDownload(item)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                      style={{ background: "var(--color-red)" }}>
                      <Download size={14} color="white" />
                    </button>
                  )}
                  {item.status === "downloading" && (
                    <button onClick={() => cancelDownload(item.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.08)" }}>
                      <XCircle size={14} color="rgba(255,255,255,0.6)" />
                    </button>
                  )}
                  {item.status === "error" && (
                    <button onClick={() => startDownload(item)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(239,68,68,0.15)" }}>
                      <Download size={14} color="#ef4444" />
                    </button>
                  )}
                  <button onClick={() => removeDownload(item.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    style={{ background: "rgba(255,255,255,0.06)" }}>
                    <Trash2 size={14} color="rgba(255,255,255,0.4)" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info armazenamento */}
      {doneCount > 0 && (
        <div className="mt-6 flex items-center gap-3 p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <HardDrive size={18} color="rgba(255,255,255,0.3)" />
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
            Os downloads ficam salvos no seu dispositivo e podem ser acessados sem internet.
          </p>
        </div>
      )}
    </div>
  );
}