"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, BookOpen, Plus, X, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import JSZip from "jszip";

export default function AdminLeituraPage() {
  const supabase = createClient();
  const [step, setStep] = useState<"titulo" | "capitulo" | "gerenciar">("titulo");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // Novo título
  const [titulo, setTitulo] = useState({ title: "", description: "", author: "", type: "manga", status: "ongoing", category: "" });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");

  // Novo capítulo
  const [comicId, setComicId] = useState("");
  const [comics, setComics] = useState<any[]>([]);
  const [chapterNum, setChapterNum] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [zipFile, setZipFile] = useState<File | null>(null);

  // Gerenciar
  const [comicsCompletos, setComicsCompletos] = useState<any[]>([]);
  const [expandido, setExpandido] = useState<string | null>(null);
  const [capitulos, setCapitulos] = useState<Record<string, any[]>>({});

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

    // Deleta arquivos do storage
    const { data: chaps } = await supabase.from("comic_chapters").select("pages").eq("comic_id", cId);
    if (chaps) {
      for (const ch of chaps) {
        const paths = (ch.pages || []).map((url: string) => url.split("/comics/")[1]);
        if (paths.length > 0) await supabase.storage.from("comics").remove(paths);
      }
    }

    await supabase.from("comics").delete().eq("id", cId);
    setMsg(`✅ "${title}" deletado!`);
    await loadComicsCompletos();
    setLoading(false);
  };

  const deletarCapitulo = async (chId: string, pages: string[], cId: string) => {
    if (!confirm("Deletar este capítulo?")) return;
    const paths = (pages || []).map((url: string) => url.split("/comics/")[1]);
    if (paths.length > 0) await supabase.storage.from("comics").remove(paths);
    await supabase.from("comic_chapters").delete().eq("id", chId);
    setMsg("✅ Capítulo deletado!");
    await loadCapitulos(cId);
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const criarTitulo = async () => {
    if (!titulo.title) return setMsg("Digite o título!");
    setLoading(true);
    setMsg("Criando título...");

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
    if (error) setMsg("Erro: " + error.message);
    else {
      setMsg("✅ Título criado!");
      setTitulo({ title: "", description: "", author: "", type: "manga", status: "ongoing", category: "" });
      setCoverFile(null);
      setCoverPreview("");
    }
    setLoading(false);
  };

  const uploadCapitulo = async () => {
    if (!comicId || !zipFile || !chapterNum) return setMsg("Preencha todos os campos!");
    setLoading(true);
    setMsg("Extraindo ZIP...");

    try {
      const zip = await JSZip.loadAsync(zipFile);
      const imageFiles: { name: string; data: Blob }[] = [];

      for (const [name, file] of Object.entries(zip.files)) {
        if (file.dir) continue;
        const ext = name.split(".").pop()?.toLowerCase();
        if (!["jpg", "jpeg", "png", "webp", "gif"].includes(ext || "")) continue;
        const blob = await file.async("blob");
        imageFiles.push({ name, data: blob });
      }

      imageFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
      setMsg(`📦 ${imageFiles.length} imagens. Enviando...`);

      const urls: string[] = [];
      for (let i = 0; i < imageFiles.length; i++) {
        const { name, data } = imageFiles[i];
        const ext = name.split(".").pop();
        const path = `chapters/${comicId}/${chapterNum}/${String(i + 1).padStart(4, "0")}.${ext}`;
        const { error } = await supabase.storage.from("comics").upload(path, data, { upsert: true, contentType: `image/${ext}` });
        if (!error) {
          const { data: urlData } = supabase.storage.from("comics").getPublicUrl(path);
          urls.push(urlData.publicUrl);
        }
        setMsg(`⬆️ ${i + 1}/${imageFiles.length} páginas...`);
      }

      const { error } = await supabase.from("comic_chapters").insert({
        comic_id: comicId,
        chapter_number: parseFloat(chapterNum),
        title: chapterTitle || null,
        pages: urls,
      });

      if (error) setMsg("Erro: " + error.message);
      else {
        setMsg(`✅ Capítulo ${chapterNum} criado com ${urls.length} páginas!`);
        setZipFile(null);
        setChapterNum("");
        setChapterTitle("");
      }
    } catch (err: any) {
      setMsg("Erro: " + err.message);
    }
    setLoading(false);
  };

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
        <button onClick={() => setStep("titulo")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${step === "titulo" ? "bg-[var(--color-red)] text-white" : "bg-white/5 text-[#888] hover:text-white"}`}>
          <Plus size={14} className="inline mr-1" /> Novo Título
        </button>
        <button onClick={() => { setStep("capitulo"); loadComics(); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${step === "capitulo" ? "bg-[var(--color-red)] text-white" : "bg-white/5 text-[#888] hover:text-white"}`}>
          <Upload size={14} className="inline mr-1" /> Upload Capítulo
        </button>
        <button onClick={() => { setStep("gerenciar"); loadComicsCompletos(); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${step === "gerenciar" ? "bg-[var(--color-red)] text-white" : "bg-white/5 text-[#888] hover:text-white"}`}>
          <Trash2 size={14} className="inline mr-1" /> Gerenciar
        </button>
      </div>

      {/* Novo Título */}
      {step === "titulo" && (
        <div className="space-y-4">
          <div className="flex gap-4 items-start">
            <div className="w-32 aspect-[2/3] rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
              {coverPreview ? <img src={coverPreview} alt="Capa" className="w-full h-full object-cover" /> : <BookOpen size={24} className="text-white/20" />}
            </div>
            <div className="flex-1 space-y-3">
              <label className="block">
                <span className="text-[#888] text-xs uppercase tracking-widest">Capa</span>
                <input type="file" accept="image/*" onChange={handleCoverChange} className="mt-1 block w-full text-sm text-[#888] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-white/10 file:text-white file:text-xs cursor-pointer" />
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
              className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/30" placeholder="Nome do título" />
          </div>
          <div>
            <span className="text-[#888] text-xs uppercase tracking-widest">Autor</span>
            <input value={titulo.author} onChange={e => setTitulo(v => ({ ...v, author: e.target.value }))}
              className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/30" placeholder="Nome do autor" />
          </div>
          <div>
            <span className="text-[#888] text-xs uppercase tracking-widest">Categoria</span>
            <input value={titulo.category} onChange={e => setTitulo(v => ({ ...v, category: e.target.value }))}
              className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/30" placeholder="Ex: Ação, Romance..." />
          </div>
          <div>
            <span className="text-[#888] text-xs uppercase tracking-widest">Sinopse</span>
            <textarea value={titulo.description} onChange={e => setTitulo(v => ({ ...v, description: e.target.value }))}
              rows={3} className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/30 resize-none" placeholder="Descrição..." />
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
                className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/30" placeholder="Ex: 1" />
            </div>
            <div>
              <span className="text-[#888] text-xs uppercase tracking-widest">Título</span>
              <input value={chapterTitle} onChange={e => setChapterTitle(e.target.value)}
                className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/30" placeholder="Opcional" />
            </div>
          </div>
          <div>
            <span className="text-[#888] text-xs uppercase tracking-widest">Arquivo ZIP ou PDF *</span>
            <label className="mt-1 flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-white/30 transition-colors bg-white/[0.02]">
              {zipFile ? (
                <div className="text-center">
                  <p className="text-white text-sm font-medium">{zipFile.name}</p>
                  <p className="text-[#555] text-xs mt-1">{(zipFile.size / 1024 / 1024).toFixed(1)} MB</p>
                  <button onClick={(e) => { e.preventDefault(); setZipFile(null); }} className="text-[var(--color-red)] text-xs mt-2 flex items-center gap-1 mx-auto">
                    <X size={12} /> Remover
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload size={24} className="text-white/20 mx-auto mb-2" />
                  <p className="text-[#555] text-sm">Clique para selecionar o ZIP ou PDF</p>
                </div>
              )}
              <input type="file" accept=".zip" className="hidden" onChange={e => setZipFile(e.target.files?.[0] || null)} />
            </label>
          </div>
          <button onClick={uploadCapitulo} disabled={loading}
            className="w-full bg-[var(--color-red)] text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? "Enviando..." : "Fazer Upload"}
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
                {comic.cover_url && <img src={comic.cover_url} alt={comic.title} className="w-10 aspect-[2/3] object-cover rounded-lg flex-shrink-0" />}
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
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#555] text-xs">{ch.pages?.length || 0} págs</span>
                        <button onClick={() => deletarCapitulo(ch.id, ch.pages, comic.id)} className="text-red-500 hover:text-red-400 transition-colors">
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

      {msg && (
        <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-white/80 text-sm">{msg}</p>
        </div>
      )}
    </div>
  );
}