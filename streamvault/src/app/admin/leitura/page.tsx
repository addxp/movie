"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, BookOpen, Plus, X, Trash2, ChevronDown, ChevronUp, AlertCircle, CheckCircle2 } from "lucide-react";
import JSZip from "jszip";

export default function AdminLeituraPage() {
  const supabase = createClient();
  const [step, setStep] = useState<"titulo" | "capitulo" | "gerenciar">("titulo");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"info" | "error" | "success">("info");
  const [progress, setProgress] = useState(0);

  const [titulo, setTitulo] = useState({ title: "", description: "", author: "", type: "manga", status: "ongoing", category: "" });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");

  const [comicId, setComicId] = useState("");
  const [comics, setComics] = useState<{id: string; title: string}[]>([]);
  const [chapterNum, setChapterNum] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const [comicsCompletos, setComicsCompletos] = useState<{id: string; title: string; type: string; cover_url?: string}[]>([]);
  const [expandido, setExpandido] = useState<string | null>(null);
  const [capitulos, setCapitulos] = useState<Record<string, {id: string; chapter_number: number; title?: string; pages: string[]; is_pdf?: boolean}[]>>({});

  const notify = (text: string, type: "info" | "error" | "success" = "info") => {
    setMsg(text);
    setMsgType(type);
  };

  const loadComics = async () => {
    const { data } = await supabase.from("comics").select("id, title").order("title");
    setComics(data || []);
  };

  const loadComicsCompletos = async () => {
    const { data } = await supabase.from("comics").select("*").order("created_at", { ascending: false });
    setComicsCompletos(data || []);
  };

  const loadCapitulos = async (cId: string) => {
    const { data } = await supabase
      .from("comic_chapters")
      .select("*")
      .eq("comic_id", cId)
      .order("chapter_number", { ascending: true });
    setCapitulos(prev => ({ ...prev, [cId]: data || [] }));
  };

  const toggleExpand = async (cId: string) => {
    if (expandido === cId) {
      setExpandido(null);
    } else {
      setExpandido(cId);
      if (!capitulos[cId]) await loadCapitulos(cId);
    }
  };

  const deletarTitulo = async (cId: string, title: string) => {
    if (!confirm(`Deletar "${title}" e todos os capítulos?`)) return;
    setLoading(true);
    const { data: chaps } = await supabase.from("comic_chapters").select("pages").eq("comic_id", cId);
    if (chaps) {
      for (const ch of chaps) {
        const paths = (ch.pages || []).map((url: string) => url.split("/comics/")[1]).filter(Boolean);
        if (paths.length > 0) await supabase.storage.from("comics").remove(paths);
      }
    }
    await supabase.from("comics").delete().eq("id", cId);
    notify(`"${title}" deletado!`, "success");
    await loadComicsCompletos();
    setLoading(false);
  };

  const deletarCapitulo = async (chId: string, pages: string[], cId: string) => {
    if (!confirm("Deletar este capítulo?")) return;
    const paths = (pages || []).map((url: string) => url.split("/comics/")[1]).filter(Boolean);
    if (paths.length > 0) await supabase.storage.from("comics").remove(paths);
    await supabase.from("comic_chapters").delete().eq("id", chId);
    notify("Capítulo deletado!", "success");
    await loadCapitulos(cId);
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const criarTitulo = async () => {
    if (!titulo.title) return notify("Digite o título!", "error");
    setLoading(true);
    notify("Criando título...", "info");

    let cover_url = "";
    if (coverFile) {
      const ext = coverFile.name.split(".").pop();
      const path = `covers/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("comics").upload(path, coverFile, { upsert: true });
      if (!error) {
        const { data } = supabase.storage.from("comics").getPublicUrl(path);
        cover_url = data.publicUrl;
      }
    }

    const { error } = await supabase.from("comics").insert({ ...titulo, cover_url });
    if (error) notify("Erro: " + error.message, "error");
    else {
      notify("Título criado com sucesso!", "success");
      setTitulo({ title: "", description: "", author: "", type: "manga", status: "ongoing", category: "" });
      setCoverFile(null);
      setCoverPreview("");
    }
    setLoading(false);
  };

  const uploadCapitulo = async () => {
    if (!comicId) return notify("Selecione um título!", "error");
    if (!chapterNum) return notify("Digite o número do capítulo!", "error");
    if (!uploadFile) return notify("Selecione um arquivo ZIP ou PDF!", "error");

    setLoading(true);
    setProgress(0);
    notify("Iniciando upload...", "info");

    // ── PDF ──────────────────────────────────────────
    if (uploadFile.name.toLowerCase().endsWith(".pdf")) {
      const fileSizeMB = uploadFile.size / 1024 / 1024;
      if (fileSizeMB > 49) {
        notify(`Arquivo muito grande (${fileSizeMB.toFixed(1)} MB). O limite é 49 MB.`, "error");
        setLoading(false);
        return;
      }

      notify(`Enviando PDF (${fileSizeMB.toFixed(1)} MB)...`, "info");
      const path = `chapters/${comicId}/${chapterNum}/book.pdf`;

      const { error } = await supabase.storage.from("comics").upload(path, uploadFile, {
        upsert: true,
        contentType: "application/pdf",
      });

      if (error) {
        notify("Erro no upload do PDF: " + error.message, "error");
        setLoading(false);
        return;
      }

      setProgress(80);
      const { data: urlData } = supabase.storage.from("comics").getPublicUrl(path);

      const { error: dbError } = await supabase.from("comic_chapters").insert({
        comic_id: comicId,
        chapter_number: parseFloat(chapterNum),
        title: chapterTitle || null,
        pages: [urlData.publicUrl],
        is_pdf: true,
      });

      if (dbError) {
        notify("PDF enviado mas erro ao salvar no banco: " + dbError.message, "error");
      } else {
        setProgress(100);
        notify("PDF enviado com sucesso!", "success");
        setUploadFile(null);
        setChapterNum("");
        setChapterTitle("");
      }

      setLoading(false);
      return;
    }

    // ── ZIP ──────────────────────────────────────────
    if (!uploadFile.name.toLowerCase().endsWith(".zip")) {
      notify("Formato inválido. Use apenas .zip ou .pdf", "error");
      setLoading(false);
      return;
    }

    try {
      notify("Lendo arquivo ZIP...", "info");
      const zip = await JSZip.loadAsync(uploadFile);
      const imageFiles: { name: string; data: Blob }[] = [];

      for (const [name, file] of Object.entries(zip.files)) {
        if (file.dir) continue;
        const ext = name.split(".").pop()?.toLowerCase();
        if (!["jpg", "jpeg", "png", "webp", "gif"].includes(ext || "")) continue;
        const blob = await file.async("blob");
        imageFiles.push({ name, data: blob });
      }

      if (imageFiles.length === 0) {
        notify("Nenhuma imagem encontrada no ZIP. Verifique se o arquivo contém imagens JPG, PNG ou WebP.", "error");
        setLoading(false);
        return;
      }

      imageFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
      notify(`${imageFiles.length} imagens encontradas. Enviando...`, "info");

      const urls: string[] = [];
      const errors: string[] = [];

      for (let i = 0; i < imageFiles.length; i++) {
        const { name, data } = imageFiles[i];
        const ext = name.split(".").pop();
        const path = `chapters/${comicId}/${chapterNum}/${String(i + 1).padStart(4, "0")}.${ext}`;

        const { error } = await supabase.storage.from("comics").upload(path, data, {
          upsert: true,
          contentType: `image/${ext === "jpg" ? "jpeg" : ext}`,
        });

        if (error) {
          errors.push(`Página ${i + 1}: ${error.message}`);
        } else {
          const { data: urlData } = supabase.storage.from("comics").getPublicUrl(path);
          urls.push(urlData.publicUrl);
        }

        const pct = Math.round(((i + 1) / imageFiles.length) * 90);
        setProgress(pct);
        notify(`Enviando ${i + 1}/${imageFiles.length} páginas...`, "info");
      }

      if (urls.length === 0) {
        notify("Nenhuma imagem foi enviada com sucesso. Erros: " + errors.slice(0, 2).join(", "), "error");
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("comic_chapters").insert({
        comic_id: comicId,
        chapter_number: parseFloat(chapterNum),
        title: chapterTitle || null,
        pages: urls,
        is_pdf: false,
      });

      if (error) {
        notify("Imagens enviadas mas erro ao salvar no banco: " + error.message, "error");
      } else {
        setProgress(100);
        const warn = errors.length > 0 ? ` (${errors.length} falhas)` : "";
        notify(`Capítulo ${chapterNum} criado com ${urls.length} páginas!${warn}`, "success");
        setUploadFile(null);
        setChapterNum("");
        setChapterTitle("");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      notify("Erro ao processar ZIP: " + msg, "error");
    }

    setLoading(false);
    setProgress(0);
  };

  const msgColor = {
    info: "bg-white/5 border-white/10 text-white/80",
    error: "bg-red-500/10 border-red-500/30 text-red-400",
    success: "bg-green-500/10 border-green-500/30 text-green-400",
  }[msgType];

  const MsgIcon = msgType === "error" ? AlertCircle : CheckCircle2;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pt-8 pb-16 px-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "var(--font-display)" }}>
          ADMIN — LEITURA
        </h1>
        <p className="text-[#555] text-sm">Gerencie títulos e capítulos</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 flex-wrap">
        <button onClick={() => { setStep("titulo"); setMsg(""); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${step === "titulo" ? "bg-[var(--color-red)] text-white" : "bg-white/5 text-[#888] hover:text-white"}`}>
          <Plus size={14} className="inline mr-1" /> Novo Título
        </button>
        <button onClick={() => { setStep("capitulo"); setMsg(""); loadComics(); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${step === "capitulo" ? "bg-[var(--color-red)] text-white" : "bg-white/5 text-[#888] hover:text-white"}`}>
          <Upload size={14} className="inline mr-1" /> Upload Capítulo
        </button>
        <button onClick={() => { setStep("gerenciar"); setMsg(""); loadComicsCompletos(); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${step === "gerenciar" ? "bg-[var(--color-red)] text-white" : "bg-white/5 text-[#888] hover:text-white"}`}>
          <Trash2 size={14} className="inline mr-1" /> Gerenciar
        </button>
      </div>

      {/* Mensagem — visível em TODOS os steps */}
      {msg && (
        <div className={`mb-4 p-4 rounded-xl border flex items-start gap-3 ${msgColor}`}>
          {msgType !== "info" && <MsgIcon size={16} className="shrink-0 mt-0.5" />}
          <p className="text-sm">{msg}</p>
        </div>
      )}

      {/* Barra de progresso — visível durante upload */}
      {loading && progress > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-[#555] mb-1">
            <span>Progresso</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%`, background: "var(--color-red)" }}
            />
          </div>
        </div>
      )}

      {/* Novo Título */}
      {step === "titulo" && (
        <div className="space-y-4">
          <div className="flex gap-4 items-start">
            <div className="w-32 aspect-[2/3] rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
              {coverPreview
                ? <img src={coverPreview} alt="Capa" className="w-full h-full object-cover" />
                : <BookOpen size={24} className="text-white/20" />}
            </div>
            <div className="flex-1 space-y-3">
              <label className="block">
                <span className="text-[#888] text-xs uppercase tracking-widest">Capa</span>
                <input type="file" accept="image/*" onChange={handleCoverChange}
                  className="mt-1 block w-full text-sm text-[#888] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-white/10 file:text-white file:text-xs cursor-pointer" />
              </label>
              <div>
                <span className="text-[#888] text-xs uppercase tracking-widest">Tipo</span>
                <div className="flex gap-2 mt-1">
                  {["manga", "comic", "book"].map(t => (
                    <button key={t} onClick={() => setTitulo(v => ({ ...v, type: t }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${titulo.type === t ? "bg-[var(--color-red)] text-white" : "bg-white/5 text-[#888] hover:text-white"}`}>
                      {t === "manga" ? "Mangá" : t === "comic" ? "HQ" : "Livro"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <span className="text-[#888] text-xs uppercase tracking-widest">Título *</span>
            <input value={titulo.title} onChange={e => setTitulo(v => ({ ...v, title: e.target.value }))}
              className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/30"
              placeholder="Nome do título" />
          </div>
          <div>
            <span className="text-[#888] text-xs uppercase tracking-widest">Autor</span>
            <input value={titulo.author} onChange={e => setTitulo(v => ({ ...v, author: e.target.value }))}
              className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/30"
              placeholder="Nome do autor" />
          </div>
          <div>
            <span className="text-[#888] text-xs uppercase tracking-widest">Categoria</span>
            <input value={titulo.category} onChange={e => setTitulo(v => ({ ...v, category: e.target.value }))}
              className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/30"
              placeholder="Ex: Ação, Romance..." />
          </div>
          <div>
            <span className="text-[#888] text-xs uppercase tracking-widest">Sinopse</span>
            <textarea value={titulo.description} onChange={e => setTitulo(v => ({ ...v, description: e.target.value }))}
              rows={3} className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/30 resize-none"
              placeholder="Descrição..." />
          </div>
          <div>
            <span className="text-[#888] text-xs uppercase tracking-widest">Status</span>
            <div className="flex gap-2 mt-1">
              {["ongoing", "completed"].map(s => (
                <button key={s} onClick={() => setTitulo(v => ({ ...v, status: s }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${titulo.status === s ? "bg-[var(--color-red)] text-white" : "bg-white/5 text-[#888] hover:text-white"}`}>
                  {s === "ongoing" ? "Em curso" : "Completo"}
                </button>
              ))}
            </div>
          </div>
          <button onClick={criarTitulo} disabled={loading}
            className="w-full bg-[var(--color-red)] text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? "Criando..." : "Criar Título"}
          </button>
        </div>
      )}

      {/* Upload Capítulo */}
      {step === "capitulo" && (
        <div className="space-y-4">
          <div>
            <span className="text-[#888] text-xs uppercase tracking-widest">Título *</span>
            <select value={comicId} onChange={e => setComicId(e.target.value)}
              className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none">
              <option value="" className="bg-[#111]">Selecione...</option>
              {comics.map(c => <option key={c.id} value={c.id} className="bg-[#111]">{c.title}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[#888] text-xs uppercase tracking-widest">Número *</span>
              <input type="number" value={chapterNum} onChange={e => setChapterNum(e.target.value)} step="0.1"
                className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/30"
                placeholder="Ex: 1" />
            </div>
            <div>
              <span className="text-[#888] text-xs uppercase tracking-widest">Título cap.</span>
              <input value={chapterTitle} onChange={e => setChapterTitle(e.target.value)}
                className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/30"
                placeholder="Opcional" />
            </div>
          </div>

          <div>
            <span className="text-[#888] text-xs uppercase tracking-widest">Arquivo *</span>
            <p className="text-[#444] text-xs mt-0.5 mb-1">ZIP com imagens ou PDF · Máximo 49 MB</p>
            <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-white/30 transition-colors bg-white/[0.02]">
              {uploadFile ? (
                <div className="text-center px-4">
                  <p className="text-white text-sm font-medium truncate max-w-full">{uploadFile.name}</p>
                  <p className="text-[#555] text-xs mt-1">{(uploadFile.size / 1024 / 1024).toFixed(1)} MB</p>
                  <p className="text-xs mt-1 font-bold uppercase" style={{ color: uploadFile.size / 1024 / 1024 > 49 ? "#f87171" : "var(--color-red)" }}>
                    {uploadFile.name.toLowerCase().endsWith(".pdf") ? "PDF" : "ZIP"}
                    {uploadFile.size / 1024 / 1024 > 49 && " — MUITO GRANDE"}
                  </p>
                  <button
                    onClick={(e) => { e.preventDefault(); setUploadFile(null); setMsg(""); }}
                    className="text-[var(--color-red)] text-xs mt-2 flex items-center gap-1 mx-auto hover:opacity-80"
                  >
                    <X size={12} /> Remover
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload size={24} className="text-white/20 mx-auto mb-2" />
                  <p className="text-[#555] text-sm">Clique para selecionar</p>
                  <p className="text-[#444] text-xs mt-1">ZIP com imagens ou arquivo PDF</p>
                </div>
              )}
              <input type="file" accept=".zip,.pdf" className="hidden"
                onChange={e => { setUploadFile(e.target.files?.[0] || null); setMsg(""); }} />
            </label>
          </div>

          <button
            onClick={uploadCapitulo}
            disabled={loading || !uploadFile || !comicId || !chapterNum}
            className="w-full bg-[var(--color-red)] text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? (msg || "Enviando...") : "Fazer Upload"}
          </button>
        </div>
      )}

      {/* Gerenciar */}
      {step === "gerenciar" && (
        <div className="space-y-3">
          {comicsCompletos.length === 0 ? (
            <p className="text-[#555] text-center py-8">Nenhum título cadastrado.</p>
          ) : comicsCompletos.map(comic => (
            <div key={comic.id} className="bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 p-4">
                {comic.cover_url && (
                  <img src={comic.cover_url} alt={comic.title} className="w-10 aspect-[2/3] object-cover rounded-lg flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium line-clamp-1">{comic.title}</p>
                  <p className="text-[#555] text-xs capitalize">{comic.type}</p>
                </div>
                <button onClick={() => toggleExpand(comic.id)} className="text-[#888] hover:text-white transition-colors p-1">
                  {expandido === comic.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                <button onClick={() => deletarTitulo(comic.id, comic.title)} disabled={loading}
                  className="text-red-500 hover:text-red-400 transition-colors p-1">
                  <Trash2 size={16} />
                </button>
              </div>

              {expandido === comic.id && (
                <div className="border-t border-white/5 p-3 space-y-2">
                  {!capitulos[comic.id] ? (
                    <p className="text-[#555] text-xs text-center py-2">Carregando...</p>
                  ) : capitulos[comic.id].length === 0 ? (
                    <p className="text-[#555] text-xs text-center py-2">Nenhum capítulo.</p>
                  ) : capitulos[comic.id].map(ch => (
                    <div key={ch.id} className="flex items-center justify-between px-3 py-2 bg-white/[0.03] rounded-lg">
                      <div>
                        <span className="text-[var(--color-red)] text-xs font-bold mr-2">#{ch.chapter_number}</span>
                        <span className="text-white/70 text-xs">{ch.title || `Capítulo ${ch.chapter_number}`}</span>
                        {ch.is_pdf && <span className="ml-2 text-blue-400 text-[9px] bg-blue-500/10 px-1.5 py-0.5 rounded uppercase font-bold">PDF</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#555] text-xs">{ch.pages?.length || 0} págs</span>
                        <button onClick={() => deletarCapitulo(ch.id, ch.pages, comic.id)}
                          className="text-red-500 hover:text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}