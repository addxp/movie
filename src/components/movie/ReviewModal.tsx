// components/ReviewModal.jsx
// Modal para escrever/editar um review de um filme
// Props:
//   movie       — { id, title, year, poster_url, director }
//   userId      — ID do usuário logado
//   existingReview — review já existente (para edição), ou null
//   onClose     — função chamada ao fechar
//   onSaved     — função chamada após salvar (recebe o review salvo)

'use client'

import { useState } from 'react'
import { useSubmitReview, useDeleteReview } from '@/hooks/useReviews'

const RATINGS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]

export default function ReviewModal({ movie, userId, existingReview = null, onClose, onSaved }) {
  const [rating, setRating] = useState(existingReview?.rating ?? 0)
  const [hoverRating, setHoverRating] = useState(0)
  const [body, setBody] = useState(existingReview?.body ?? '')
  const [watchedOn, setWatchedOn] = useState(existingReview?.watched_on ?? '')
  const [containsSpoiler, setContainsSpoiler] = useState(existingReview?.contains_spoiler ?? false)

  const { submit, loading: saving } = useSubmitReview()
  const { deleteReview, loading: deleting } = useDeleteReview()

  const handleSubmit = async () => {
    if (!userId) return
    const { data, error } = await submit({
      userId,
      movieId: movie.id,
      rating: rating || null,
      body: body.trim() || null,
      watchedOn: watchedOn || null,
      containsSpoiler,
    })
    if (!error) {
      onSaved?.(data)
      onClose()
    }
  }

  const handleDelete = async () => {
    if (!existingReview) return
    const { error } = await deleteReview(existingReview.id)
    if (!error) {
      onSaved?.(null)
      onClose()
    }
  }

  // Renderiza as estrelas (5 estrelas, cada uma pode ser cheia ou meia)
  const displayRating = hoverRating || rating
  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => {
      const full = displayRating >= star
      const half = !full && displayRating >= star - 0.5
      return (
        <span
          key={star}
          style={{ position: 'relative', display: 'inline-block', width: 28, height: 28, cursor: 'pointer' }}
        >
          {/* metade esquerda */}
          <span
            style={{ position: 'absolute', left: 0, width: '50%', height: '100%', zIndex: 1 }}
            onMouseEnter={() => setHoverRating(star - 0.5)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(star - 0.5)}
          />
          {/* metade direita */}
          <span
            style={{ position: 'absolute', right: 0, width: '50%', height: '100%', zIndex: 1 }}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(star)}
          />
          <span style={{ fontSize: 24, color: full || half ? '#EF9F27' : '#ccc', userSelect: 'none' }}>
            {full ? '★' : half ? '⯨' : '☆'}
          </span>
        </span>
      )
    })
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: 'var(--color-background-primary, #fff)',
          borderRadius: 16,
          border: '0.5px solid var(--color-border-tertiary)',
          width: '100%', maxWidth: 480,
          overflow: 'hidden',
        }}
      >
        {/* Cabeçalho com filme */}
        <div style={{ display: 'flex', gap: 14, padding: '20px 20px 16px', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
          {movie.poster_url ? (
            <img
              src={movie.poster_url}
              alt={movie.title}
              style={{ width: 54, height: 80, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
            />
          ) : (
            <div style={{
              width: 54, height: 80, borderRadius: 6, flexShrink: 0,
              background: 'var(--color-background-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24,
            }}>🎬</div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 17, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                {movie.title}
              </span>
              {movie.year && (
                <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{movie.year}</span>
              )}
            </div>
            {movie.director && (
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 10 }}>
                {movie.director}
              </div>
            )}
            {/* Estrelas */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {renderStars()}
              {rating > 0 && (
                <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginLeft: 6 }}>
                  {rating} / 5
                </span>
              )}
              {rating > 0 && (
                <button
                  onClick={() => setRating(0)}
                  style={{
                    marginLeft: 4, fontSize: 12, color: 'var(--color-text-secondary)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  }}
                >
                  limpar
                </button>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--color-text-secondary)', fontSize: 20, padding: 0,
              alignSelf: 'flex-start',
            }}
          >
            ✕
          </button>
        </div>

        {/* Corpo do review */}
        <div style={{ padding: '16px 20px' }}>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Escreva sua review... (opcional)"
            rows={5}
            style={{
              width: '100%', resize: 'vertical',
              border: '0.5px solid var(--color-border-secondary)',
              borderRadius: 8, padding: '10px 12px',
              fontSize: 14, lineHeight: 1.6,
              background: 'var(--color-background-primary)',
              color: 'var(--color-text-primary)',
              fontFamily: 'inherit',
              marginBottom: 12,
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
            <label style={{ fontSize: 13, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              Assistido em:
              <input
                type="date"
                value={watchedOn}
                onChange={(e) => setWatchedOn(e.target.value)}
                style={{
                  border: '0.5px solid var(--color-border-secondary)',
                  borderRadius: 6, padding: '4px 8px', fontSize: 13,
                  background: 'var(--color-background-primary)',
                  color: 'var(--color-text-primary)',
                }}
              />
            </label>

            <label style={{ fontSize: 13, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={containsSpoiler}
                onChange={(e) => setContainsSpoiler(e.target.checked)}
              />
              Contém spoilers
            </label>
          </div>

          {/* Botões */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleSubmit}
              disabled={saving}
              style={{
                flex: 1, padding: '10px 0',
                background: '#1D9E75', color: '#fff',
                border: 'none', borderRadius: 8,
                fontSize: 14, fontWeight: 500,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
                transition: 'background 0.15s',
              }}
            >
              {saving ? 'Salvando...' : existingReview ? 'Atualizar review' : 'Salvar review'}
            </button>

            {existingReview && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  padding: '10px 16px',
                  background: 'none',
                  color: '#E24B4A',
                  border: '0.5px solid #E24B4A',
                  borderRadius: 8,
                  fontSize: 14,
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  opacity: deleting ? 0.7 : 1,
                }}
              >
                {deleting ? '...' : 'Apagar'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}