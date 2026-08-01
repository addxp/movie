import Link from "next/link";

const COLUMNS = [
  { title: "Navegação", links: [["Início", "/browse"], ["Séries", "/series"], ["Animes", "/animes"], ["Ao Vivo", "/live"]] },
  { title: "Conta", links: [["Meu Perfil", "/profile"], ["Favoritos", "/favorites"], ["Downloads", "/downloads"]] },
  { title: "Suporte", links: [["Central de Ajuda", "/requests"], ["Solicitar Título", "/requests"]] },
  { title: "Social", links: [["Instagram", "#"], ["X", "#"], ["Discord", "#"]] },
];

export default function SiteFooter() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)", padding: "48px clamp(24px, 5vw, 72px) 32px", marginTop: "24px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "32px", marginBottom: "36px" }}>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "14px" }}>
              {col.title}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {col.links.map(([label, href]) => (
                <Link key={label} href={href} style={{ fontSize: "13px", color: "var(--text-2)", textDecoration: "none", fontFamily: "var(--font-body)" }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: "20px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
        <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "var(--text-4)" }}>
          © {new Date().getFullYear()} STREAM<span style={{ color: "var(--red)" }}>VAULT</span>. Todos os direitos reservados.
        </span>
      </div>
    </footer>
  );
}
