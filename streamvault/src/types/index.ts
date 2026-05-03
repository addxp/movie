export interface Movie {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  video_url: string;
  category: string;
  collection?: string;
  type?: 'movie' | 'series';
  release_year?: number;
  rating?: number;
  duration?: number;
  backdrop?: string;
  genre?: string[];
  created_at?: string;
}

export interface Episode {
  id: string;
  movie_id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail?: string;
  season: number;
  episode: number;
  duration?: number;
  created_at?: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  movie_id: string;
  created_at: string;
  movie?: Movie;
}