# StreamVault — Redesign Cineverse

## Arquivos alterados

| Arquivo redesign                               | Substituir em                                                  |
|------------------------------------------------|----------------------------------------------------------------|
| `src/app/globals.css`                          | `streamvault/src/app/globals.css`                              |
| `src/components/layout/Navbar.tsx`             | `streamvault/src/components/layout/Navbar.tsx`                 |
| `src/components/movie/HeroBanner.tsx`          | `streamvault/src/components/movie/HeroBanner.tsx`              |
| `src/components/movie/MovieCard.tsx`           | `streamvault/src/components/movie/MovieCard.tsx`               |
| `src/components/movie/MovieRow.tsx`            | `streamvault/src/components/movie/MovieRow.tsx`                |
| `src/components/movie/BrowseClient.tsx`        | `streamvault/src/components/movie/BrowseClient.tsx`            |
| `src/components/movie/TrendingRow.tsx`         | **NOVO** — adicionar em `streamvault/src/components/movie/`    |

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
