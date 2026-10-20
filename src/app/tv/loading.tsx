// Tela de carregamento mínima (sem animação) enquanto o servidor busca os dados.
export default function TVLoading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080810",
        color: "rgba(255,255,255,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "-apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
        fontSize: 22,
      }}
    >
      Carregando…
    </div>
  );
}
