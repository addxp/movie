import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LeitorPage from "@/components/leitura/LeitorPage";
import PDFLeitorPage from "@/components/leitura/PDFLeitorPage";

export default async function LerPage({ params }: { params: Promise<{ id: string; chapterId: string }> }) {
  const { id, chapterId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: chapter } = await supabase.from("comic_chapters").select("*").eq("id", chapterId).single();
  if (!chapter) redirect(`/leitura/${id}`);

  const { data: allChapters } = await supabase
    .from("comic_chapters")
    .select("id, chapter_number, title")
    .eq("comic_id", id)
    .order("chapter_number", { ascending: true });

  const currentIndex = allChapters?.findIndex(c => c.id === chapterId) ?? 0;
  const prevChapter = currentIndex > 0 ? allChapters![currentIndex - 1] : null;
  const nextChapter = allChapters && currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

  // Se tiver PDF usa o leitor de PDF
  if (chapter.pdf_url) {
    return (
      <PDFLeitorPage
        pdfUrl={chapter.pdf_url}
        comicId={id}
        chapterNum={chapter.chapter_number}
        chapterTitle={chapter.title}
        prevChapterId={prevChapter?.id || null}
        nextChapterId={nextChapter?.id || null}
      />
    );
  }

  return (
    <LeitorPage
      pages={chapter.pages || []}
      comicId={id}
      chapterId={chapterId}
      chapterNum={chapter.chapter_number}
      chapterTitle={chapter.title}
      prevChapterId={prevChapter?.id || null}
      nextChapterId={nextChapter?.id || null}
    />
  );
}