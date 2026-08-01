// hooks/useReviews.ts
// Hooks para o sistema de reviews estilo Letterboxd
// Requer: @supabase/supabase-js, lib/supabaseClient configurado

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

export interface Profile {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
}

export interface Review {
  id: number
  user_id: string
  movie_id: number
  rating: number
  body: string | null
  watched_on: string | null
  contains_spoiler: boolean
  created_at: string
  [key: string]: unknown
}

export interface Movie {
  id: number
  title: string
  year: number
  poster_url: string | null
}

export interface ListMovie extends Movie {
  note: string | null
  position: number
}

export interface UserList {
  id: number
  name: string
  description: string | null
  is_public: boolean
  created_at: string
  updated_at: string
  movies_count: number
}

// ─────────────────────────────────────────────
// FEED
// ─────────────────────────────────────────────

interface UseFeedOptions {
  mode?: 'global' | 'following'
  userId?: string | null
  limit?: number
}

/**
 * Retorna o feed global (todos os reviews) ou só de quem o usuário segue.
 */
export function useFeed({ mode = 'global', userId = null, limit = 20 }: UseFeedOptions = {}) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFeed = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('reviews_feed')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (mode === 'following' && userId) {
        const { data: followed } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', userId)

        const ids = (followed ?? []).map((f: { following_id: string }) => f.following_id)
        if (ids.length === 0) {
          setReviews([])
          return
        }
        query = query.in('user_id', ids)
      }

      const { data, error: err } = await query
      if (err) throw err
      setReviews(data ?? [])
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [mode, userId, limit])

  useEffect(() => { fetchFeed() }, [fetchFeed])

  return { reviews, loading, error, refetch: fetchFeed }
}

// ─────────────────────────────────────────────
// REVIEW ÚNICO
// ─────────────────────────────────────────────

interface SubmitReviewParams {
  userId: string
  movieId: number
  rating: number
  body: string
  watchedOn: string | null
  containsSpoiler?: boolean
}

/**
 * Cria ou atualiza um review (upsert).
 */
export function useSubmitReview() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = useCallback(async ({
    userId,
    movieId,
    rating,
    body,
    watchedOn,
    containsSpoiler = false,
  }: SubmitReviewParams): Promise<{ data: Review | null; error: string | null }> => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('reviews')
        .upsert(
          {
            user_id: userId,
            movie_id: movieId,
            rating,
            body,
            watched_on: watchedOn,
            contains_spoiler: containsSpoiler,
          },
          { onConflict: 'user_id,movie_id' }
        )
        .select()
        .single()

      if (err) throw err
      return { data, error: null }
    } catch (err) {
      const message = (err as Error).message
      setError(message)
      return { data: null, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  return { submit, loading, error }
}

/**
 * Deleta um review pelo ID.
 */
export function useDeleteReview() {
  const [loading, setLoading] = useState(false)

  const deleteReview = useCallback(async (reviewId: number): Promise<{ error: string | null }> => {
    setLoading(true)
    const { error } = await supabase.from('reviews').delete().eq('id', reviewId)
    setLoading(false)
    return { error: error?.message ?? null }
  }, [])

  return { deleteReview, loading }
}

// ─────────────────────────────────────────────
// LIKES
// ─────────────────────────────────────────────

/**
 * Toggle like em um review.
 */
export function useLike() {
  const [loading, setLoading] = useState(false)

  const toggleLike = useCallback(async (
    userId: string | null,
    reviewId: number,
    currentlyLiked: boolean
  ): Promise<{ error: string | null }> => {
    if (!userId) return { error: 'Faça login para curtir.' }
    setLoading(true)
    let error = null

    if (currentlyLiked) {
      const { error: err } = await supabase
        .from('review_likes')
        .delete()
        .match({ user_id: userId, review_id: reviewId })
      error = err
    } else {
      const { error: err } = await supabase
        .from('review_likes')
        .insert({ user_id: userId, review_id: reviewId })
      error = err
    }

    setLoading(false)
    return { error: (error as { message?: string } | null)?.message ?? null }
  }, [])

  return { toggleLike, loading }
}

/**
 * Verifica quais reviews de uma lista o usuário curtiu.
 * Retorna um Set com os IDs dos reviews curtidos.
 */
export function useUserLikes(userId: string | null, reviewIds: number[] = []): Set<number> {
  const [likedSet, setLikedSet] = useState<Set<number>>(new Set())

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!userId || reviewIds.length === 0) return
    supabase
      .from('review_likes')
      .select('review_id')
      .eq('user_id', userId)
      .in('review_id', reviewIds)
      .then(({ data }) => {
        setLikedSet(new Set((data ?? []).map((l: { review_id: number }) => l.review_id)))
      })
  }, [userId, reviewIds.join(',')])  // join mantém a estabilidade da dependência

  return likedSet
}

// ─────────────────────────────────────────────
// SEGUIDORES / SEGUINDO
// ─────────────────────────────────────────────

/**
 * Retorna seguidores e seguindo de um usuário.
 */
export function useFollows(profileId: string | null) {
  const [followers, setFollowers] = useState<Profile[]>([])
  const [following, setFollowing] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profileId) return
    setLoading(true)

    Promise.all([
      supabase
        .from('follows')
        .select('follower:profiles!follower_id(id, username, display_name, avatar_url)')
        .eq('following_id', profileId),
      supabase
        .from('follows')
        .select('following:profiles!following_id(id, username, display_name, avatar_url)')
        .eq('follower_id', profileId),
    ]).then(([{ data: frs }, { data: fing }]) => {
      setFollowing((fing ?? []).map((r: any) => r.following as Profile))
      setLoading(false)
    })
  }, [profileId])

  return { followers, following, loading }
}

/**
 * Toggle seguir/deixar de seguir um usuário.
 */
export function useFollow() {
  const [loading, setLoading] = useState(false)

  const toggleFollow = useCallback(async (
    followerId: string | null,
    followingId: string,
    currentlyFollowing: boolean
  ): Promise<{ error: string | null }> => {
    if (!followerId) return { error: 'Faça login para seguir.' }
    setLoading(true)
    let error = null

    if (currentlyFollowing) {
      const { error: err } = await supabase
        .from('follows')
        .delete()
        .match({ follower_id: followerId, following_id: followingId })
      error = err
    } else {
      const { error: err } = await supabase
        .from('follows')
        .insert({ follower_id: followerId, following_id: followingId })
      error = err
    }

    setLoading(false)
    return { error: (error as { message?: string } | null)?.message ?? null }
  }, [])

  return { toggleFollow, loading }
}

/**
 * Verifica se o usuário atual segue um perfil específico.
 */
export function useIsFollowing(followerId: string | null, followingId: string | null): boolean {
  const [isFollowing, setIsFollowing] = useState(false)

  useEffect(() => {
    if (!followerId || !followingId) return
    supabase
      .from('follows')
      .select('follower_id')
      .match({ follower_id: followerId, following_id: followingId })
      .maybeSingle()
      .then(({ data }) => setIsFollowing(!!data))
  }, [followerId, followingId])

  return isFollowing
}

// ─────────────────────────────────────────────
// LISTAS PERSONALIZADAS
// ─────────────────────────────────────────────

/**
 * Busca as listas de um usuário (com contagem de filmes).
 */
export function useLists(userId: string | null) {
  const [lists, setLists] = useState<UserList[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLists = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('lists')
      .select(`
        id, name, description, is_public, created_at, updated_at,
        list_movies(count)
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (!error) {
      setLists(
     (data ?? []).map((l: any) => ({
  ...l,
  movies_count: l.list_movies?.[0]?.count ?? 0,
}))
      )
    }
    setLoading(false)
  }, [userId])

  useEffect(() => { fetchLists() }, [fetchLists])

  return { lists, loading, refetch: fetchLists }
}

interface CreateListParams {
  userId: string
  name: string
  description?: string
  isPublic?: boolean
}

/**
 * Cria uma nova lista.
 */
export function useCreateList() {
  const [loading, setLoading] = useState(false)

  const createList = useCallback(async ({
    userId,
    name,
    description,
    isPublic = true,
  }: CreateListParams): Promise<{ data: UserList | null; error: string | null }> => {
    setLoading(true)
    const { data, error } = await supabase
      .from('lists')
      .insert({ user_id: userId, name, description, is_public: isPublic })
      .select()
      .single()
    setLoading(false)
    return { data, error: error?.message ?? null }
  }, [])

  return { createList, loading }
}

/**
 * Adiciona ou remove um filme de uma lista.
 */
export function useListMovies(listId: number | null) {
  const [movies, setMovies] = useState<ListMovie[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!listId) return
    supabase
      .from('list_movies')
      .select(`position, note, movie:movies(id, title, year, poster_url)`)
      .eq('list_id', listId)
      .order('position')
      .then(({ data }) => {
        setMovies(
    (data ?? []).map((lm: any) => ({
  ...lm.movie,
  note: lm.note,
  position: lm.position,
}))
        )
        setLoading(false)
      })
  }, [listId])

  const addMovie = useCallback(async (
    movieId: number,
    note: string | null = null
  ): Promise<{ error: string | null }> => {
    const { error } = await supabase
      .from('list_movies')
      .insert({ list_id: listId, movie_id: movieId, note, position: movies.length })
    return { error: error?.message ?? null }
  }, [listId, movies.length])

  const removeMovie = useCallback(async (movieId: number): Promise<{ error: string | null }> => {
    const { error } = await supabase
      .from('list_movies')
      .delete()
      .match({ list_id: listId, movie_id: movieId })
    return { error: error?.message ?? null }
  }, [listId])

  return { movies, loading, addMovie, removeMovie }
}

// ─────────────────────────────────────────────
// PERFIL
// ─────────────────────────────────────────────

/**
 * Busca o perfil de um usuário pelo username.
 */
export function useProfile(username: string | null) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!username) return
    supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single()
      .then(({ data }) => {
        setProfile(data)
        setLoading(false)
      })
  }, [username])

  return { profile, loading }
}

/**
 * Busca os reviews de um usuário específico.
 */
export function useUserReviews(userId: string | null, limit = 20) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    supabase
      .from('reviews_feed')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
      .then(({ data }) => {
        setReviews(data ?? [])
        setLoading(false)
      })
  }, [userId, limit])

  return { reviews, loading }
}