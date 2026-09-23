
## O que mudou no design

### Visual geral
- Fonte de display: **Barlow Condensed** (pesada, condensada, cinematográfica)
- Fonte de corpo: **Barlow** (clean, legível)
- Paleta: preto profundo `#0a0a0b` com vermelho `#e8192c`
- Grain texture sutil via CSS

### Navbar
- **Sidebar icon rail** fixa na esquerda com ícones e tooltip
- Top navbar horizontal com links de texto e busca/favoritos
- Logo `STREAM VAULT` compacto no rail, completo no topo
- Drawer lateral mobile + bottom bar mobile (4 links principais)

### Hero Banner
- Label "Nº 1 em Alta" com barra vermelha à esquerda
- Título em **Barlow Condensed 800** maiúsculo
- Botão principal vermelho: "Assistir agora ▶"
- Botões ícone (coração, info) ao lado

### Trending Row (NOVO componente)
- Seção "Tendências" com **números gigantes** em outline (como na ref)
- Os números ficam sobrepostos aos posters
- Top 10 por rating de todos os filmes

### Movie Cards
- Hover: o card flutua e expande mostrando título + botões
- Botão play centralizado no poster
- Animação spring no play circle

## Instalação das fontes

O `globals.css` já importa do Google Fonts automaticamente:
```
Barlow Condensed: 300, 400, 600, 700, 800, 900
Barlow: 300, 400, 500, 600
```

## Nenhuma dependência nova necessária
Todos os componentes usam apenas o que já estava no projeto:
- `lucide-react` (já instalado)
- `next/image`, `next/link`, `@supabase/supabase-js` (já instalados)
