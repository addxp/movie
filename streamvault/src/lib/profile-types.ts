export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  joinedAt: string;
  stats: {
    watched: number;
    watchlist: number;
    reviews: number;
    followers: number;
    following: number;
  };
  favoriteGenres: string[];
  recentActivity: Activity[];
  reviews: Review[];
  watchlist: WatchlistItem[];
  isFollowing?: boolean;
  isOwnProfile?: boolean;
}

export interface Activity {
  id: string;
  type: "watched" | "reviewed" | "added_watchlist" | "followed";
  title?: string;
  poster?: string;
  rating?: number;
  comment?: string;
  targetUser?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  movieId: string;
  movieTitle: string;
  moviePoster: string;
  rating: number;
  content: string;
  likes: number;
  createdAt: string;
  liked?: boolean;
}

export interface WatchlistItem {
  id: string;
  movieId: string;
  title: string;
  poster: string;
  year: number;
  genre: string;
  addedAt: string;
}

// Mock current user
export const currentUser: UserProfile = {
  id: "1",
  username: "edgar",
  displayName: "Edgar Silva",
  avatar: "E",
  bio: "Apaixonado por filmes de animação e ficção científica. Assistindo desde 1998.",
  joinedAt: "Janeiro 2023",
  stats: {
    watched: 247,
    watchlist: 38,
    reviews: 64,
    followers: 128,
    following: 93,
  },
  favoriteGenres: ["Animação", "Sci-Fi", "Drama", "Thriller"],
  recentActivity: [
    {
      id: "a1",
      type: "reviewed",
      title: "Vida de Inseto",
      poster: "https://placehold.co/80x120/1a1a2e/e63946?text=VdI",
      rating: 7,
      comment: "Um clássico da animação que nunca envelhece!",
      createdAt: "2 horas atrás",
    },
    {
      id: "a2",
      type: "watched",
      title: "Interestelar",
      poster: "https://placehold.co/80x120/1a1a2e/e63946?text=INT",
      createdAt: "1 dia atrás",
    },
    {
      id: "a3",
      type: "added_watchlist",
      title: "Oppenheimer",
      poster: "https://placehold.co/80x120/1a1a2e/e63946?text=OPP",
      createdAt: "3 dias atrás",
    },
    {
      id: "a4",
      type: "followed",
      targetUser: "cinephile_br",
      createdAt: "5 dias atrás",
    },
  ],
  reviews: [
    {
      id: "r1",
      movieId: "1",
      movieTitle: "Vida de Inseto",
      moviePoster: "https://placehold.co/60x90/1a1a2e/e63946?text=VdI",
      rating: 7,
      content:
        "Um clássico intemporal da Pixar. A história de Flik é sobre coragem e acreditar em si mesmo. Animação incrível para 1998.",
      likes: 24,
      createdAt: "2 horas atrás",
      liked: false,
    },
    {
      id: "r2",
      movieId: "2",
      movieTitle: "Interestelar",
      moviePoster: "https://placehold.co/60x90/1a1a2e/e63946?text=INT",
      rating: 9,
      content:
        "Nolan no seu melhor. A combinação de ciência e emoção humana é magistral. Hans Zimmer fez um trabalho extraordinário na trilha.",
      likes: 87,
      createdAt: "1 dia atrás",
      liked: true,
    },
    {
      id: "r3",
      movieId: "3",
      movieTitle: "Parasita",
      moviePoster: "https://placehold.co/60x90/1a1a2e/e63946?text=PAR",
      rating: 10,
      content:
        "Obra-prima absoluta. Bong Joon-ho criou algo que vai além de qualquer gênero. Merece cada prêmio que recebeu.",
      likes: 143,
      createdAt: "1 semana atrás",
      liked: false,
    },
  ],
  watchlist: [
    {
      id: "w1",
      movieId: "4",
      title: "Oppenheimer",
      poster: "https://placehold.co/60x90/1a1a2e/e63946?text=OPP",
      year: 2023,
      genre: "Drama",
      addedAt: "3 dias atrás",
    },
    {
      id: "w2",
      movieId: "5",
      title: "Barbie",
      poster: "https://placehold.co/60x90/1a1a2e/e63946?text=BAR",
      year: 2023,
      genre: "Comédia",
      addedAt: "1 semana atrás",
    },
    {
      id: "w3",
      movieId: "6",
      title: "Duna: Parte 2",
      poster: "https://placehold.co/60x90/1a1a2e/e63946?text=DUN",
      year: 2024,
      genre: "Sci-Fi",
      addedAt: "2 semanas atrás",
    },
  ],
  isOwnProfile: true,
};

export const mockProfiles: UserProfile[] = [
  currentUser,
  {
    id: "2",
    username: "gostodefuder",
    displayName: "emman arrocha casada",
    avatar: "M",
    bio: "Crítica de cinema amadora. Amo filmes europeus e asiáticos. 🎬",
    joinedAt: "Março 2022",
    stats: {
      watched: 583,
      watchlist: 112,
      reviews: 201,
      followers: 847,
      following: 234,
    },
    favoriteGenres: ["Drama", "Romance", "Horror", "Suspense"],
    recentActivity: [
      {
        id: "a5",
        type: "reviewed",
        title: "Saltburn",
        poster: "https://placehold.co/80x120/1a1a2e/e63946?text=SAL",
        rating: 8,
        createdAt: "5 horas atrás",
      },
    ],
    reviews: [
      {
        id: "r4",
        movieId: "7",
        movieTitle: "Saltburn",
        moviePoster: "https://placehold.co/60x90/1a1a2e/e63946?text=SAL",
        rating: 8,
        content:
          "Emerald Fennell prova mais uma vez seu talento único. Visualmente deslumbrante com performances perturbadoras.",
        likes: 312,
        createdAt: "5 horas atrás",
        liked: false,
      },
    ],
    watchlist: [],
    isFollowing: true,
  },
  {
    id: "3",
    username: "filmefanatico",
    displayName: "Lucas Ferreira",
    avatar: "L",
    bio: "Marvel > DC. Não aceito discussão. 🦸",
    joinedAt: "Junho 2023",
    stats: {
      watched: 142,
      watchlist: 67,
      reviews: 28,
      followers: 45,
      following: 78,
    },
    favoriteGenres: ["Ação", "Aventura", "Sci-Fi", "Fantasia"],
    recentActivity: [],
    reviews: [],
    watchlist: [],
    isFollowing: false,
  },
];