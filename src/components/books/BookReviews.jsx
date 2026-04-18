import React, { useMemo, useState } from 'react';
import { Star, ThumbsUp, AlertTriangle, Edit2, Trash2, MessageSquare } from 'lucide-react';
import {
  useBookReviews,
  useCreateReview,
  useUpdateReview,
  useDeleteReview,
  useMarkReviewHelpful,
} from '../../hooks/useReviews';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { ConfirmDialog } from '../ui/ConfirmDialog';

/**
 * BookReviews — public reviews block for a book detail page.
 *
 * Responsibilities:
 *   - Render the list of reviews for a book.
 *   - Let the current user create / edit / delete their own review (one per book).
 *   - Let any signed-in user mark a review as helpful.
 *
 * This component is intentionally self-contained and does not depend on the
 * Toast provider (which isn't wired into the app yet). Errors surface inline.
 */
export function BookReviews({ bookId }) {
  const { user } = useAuth();
  const bookIdNum = Number(bookId);

  const { data, isLoading, isError } = useBookReviews(bookIdNum);
  const createReview = useCreateReview();
  const updateReview = useUpdateReview();
  const deleteReview = useDeleteReview();
  const markHelpful = useMarkReviewHelpful();

  const reviews = useMemo(() => data?.data?.reviews ?? [], [data]);
  const myReview = useMemo(
    () => reviews.find((r) => r.user_id === user?.id) ?? null,
    [reviews, user?.id]
  );

  const [editing, setEditing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const startEdit = () => {
    setErrorMsg(null);
    setEditing(true);
  };

  const handleSubmit = async (payload) => {
    setErrorMsg(null);
    try {
      if (myReview) {
        await updateReview.mutateAsync({ id: myReview.id, data: payload });
      } else {
        await createReview.mutateAsync({ book_id: bookIdNum, ...payload });
      }
      setEditing(false);
    } catch (err) {
      setErrorMsg(extractApiError(err, 'No se pudo guardar la reseña'));
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setErrorMsg(null);
    try {
      await deleteReview.mutateAsync(deletingId);
    } catch (err) {
      setErrorMsg(extractApiError(err, 'No se pudo borrar la reseña'));
    } finally {
      setDeletingId(null);
    }
  };

  const handleHelpful = async (id) => {
    setErrorMsg(null);
    try {
      await markHelpful.mutateAsync(id);
    } catch (err) {
      setErrorMsg(extractApiError(err, 'No se pudo registrar el voto'));
    }
  };

  return (
    <section className="mt-8 bg-white rounded-xl shadow-md p-6">
      <header className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
          <MessageSquare className="w-5 h-5 text-purple-600" />
          Reseñas
          {reviews.length > 0 && (
            <span className="text-sm font-normal text-gray-500">({reviews.length})</span>
          )}
        </h2>
        {user && !myReview && !editing && (
          <Button size="sm" onClick={startEdit}>
            Escribir reseña
          </Button>
        )}
      </header>

      {errorMsg && (
        <div
          role="alert"
          className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700"
        >
          {errorMsg}
        </div>
      )}

      {editing && (
        <ReviewForm
          initial={myReview}
          submitting={createReview.isPending || updateReview.isPending}
          onSubmit={handleSubmit}
          onCancel={() => {
            setEditing(false);
            setErrorMsg(null);
          }}
        />
      )}

      {isLoading ? (
        <div className="py-8 text-center text-gray-500">Cargando reseñas…</div>
      ) : isError ? (
        <div className="py-8 text-center text-red-600">
          No se pudieron cargar las reseñas.
        </div>
      ) : reviews.length === 0 && !editing ? (
        <EmptyState
          icon={<MessageSquare className="w-10 h-10" />}
          title="Todavía no hay reseñas"
          description="Sé el primero en compartir tu opinión sobre este libro."
          actionLabel={user ? 'Escribir reseña' : undefined}
          onAction={user ? startEdit : undefined}
        />
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              isMine={review.user_id === user?.id}
              onEdit={startEdit}
              onDelete={() => setDeletingId(review.id)}
              onHelpful={() => handleHelpful(review.id)}
              helpfulPending={markHelpful.isPending}
            />
          ))}
        </ul>
      )}

      <ConfirmDialog
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Borrar reseña"
        message="¿Seguro que quieres borrar tu reseña? Esta acción no se puede deshacer."
        confirmLabel="Borrar"
        variant="primary"
      />
    </section>
  );
}

// ---------- internal subcomponents ----------------------------------------

function ReviewCard({ review, isMine, onEdit, onDelete, onHelpful, helpfulPending }) {
  const [revealSpoiler, setRevealSpoiler] = useState(!review.is_spoiler);
  const starCount = ratingToStars(review.rating);

  return (
    <li className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900">
              {review.username || 'Usuario'}
            </span>
            {isMine && (
              <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                Tú
              </span>
            )}
          </div>
          <StarRow count={starCount} />
        </div>
        <div className="flex gap-1">
          {isMine && (
            <>
              <button
                type="button"
                onClick={onEdit}
                className="p-1.5 rounded text-gray-500 hover:text-purple-700 hover:bg-purple-50"
                aria-label="Editar reseña"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="p-1.5 rounded text-gray-500 hover:text-red-600 hover:bg-red-50"
                aria-label="Borrar reseña"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {review.review_title && (
        <h3 className="font-semibold text-gray-800 mb-1">{review.review_title}</h3>
      )}

      {review.is_spoiler && !revealSpoiler ? (
        <button
          type="button"
          onClick={() => setRevealSpoiler(true)}
          className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 hover:bg-amber-100"
        >
          <AlertTriangle className="w-4 h-4" />
          Contiene spoilers — pulsa para mostrar
        </button>
      ) : (
        review.review_text && (
          <p className="text-gray-700 whitespace-pre-line">{review.review_text}</p>
        )
      )}

      <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
        <span>{formatDate(review.created_at)}</span>
        <button
          type="button"
          onClick={onHelpful}
          disabled={helpfulPending}
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-50"
          aria-label="Marcar como útil"
        >
          <ThumbsUp className="w-4 h-4" />
          <span>Útil ({review.helpful_votes ?? 0})</span>
        </button>
      </div>
    </li>
  );
}

function ReviewForm({ initial, submitting, onSubmit, onCancel }) {
  const [rating, setRating] = useState(initial?.rating ?? 80);
  const [title, setTitle] = useState(initial?.review_title ?? '');
  const [text, setText] = useState(initial?.review_text ?? '');
  const [isSpoiler, setIsSpoiler] = useState(Boolean(initial?.is_spoiler));

  const submit = (e) => {
    e.preventDefault();
    onSubmit({
      rating,
      review_title: title.trim() || null,
      review_text: text.trim() || null,
      is_spoiler: isSpoiler,
    });
  };

  const starSelection = ratingToStars(rating);

  return (
    <form onSubmit={submit} className="mb-6 border border-purple-200 bg-purple-50 rounded-lg p-4">
      <fieldset className="mb-3">
        <legend className="block text-sm font-medium text-gray-700 mb-1">
          Puntuación
        </legend>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n * 20)}
              aria-label={`${n} de 5 estrellas`}
              className="p-1"
            >
              <Star
                className={
                  n <= starSelection
                    ? 'w-6 h-6 fill-yellow-400 text-yellow-400'
                    : 'w-6 h-6 text-gray-300'
                }
              />
            </button>
          ))}
          <span className="text-sm text-gray-600 ml-2">{rating} / 100</span>
        </div>
      </fieldset>

      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="review-title">
        Título (opcional)
      </label>
      <input
        id="review-title"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={255}
        className="w-full mb-3 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        placeholder="Un resumen corto de tu opinión"
      />

      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="review-text">
        Tu reseña
      </label>
      <textarea
        id="review-text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        className="w-full mb-3 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        placeholder="¿Qué te pareció el libro?"
      />

      <label className="flex items-center gap-2 mb-4 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={isSpoiler}
          onChange={(e) => setIsSpoiler(e.target.checked)}
          className="rounded"
        />
        Contiene spoilers
      </label>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" loading={submitting} disabled={submitting}>
          {initial ? 'Guardar cambios' : 'Publicar reseña'}
        </Button>
      </div>
    </form>
  );
}

function StarRow({ count }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${count} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={
            n <= count ? 'w-4 h-4 fill-yellow-400 text-yellow-400' : 'w-4 h-4 text-gray-300'
          }
        />
      ))}
    </div>
  );
}

// ---------- helpers --------------------------------------------------------

/**
 * API stores rating as 0–100; UI shows 1–5 stars. Round half-up.
 */
function ratingToStars(rating) {
  if (rating === null || rating === undefined) return 0;
  const n = Math.round((Number(rating) / 100) * 5);
  if (n < 0) return 0;
  if (n > 5) return 5;
  return n;
}

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

function extractApiError(err, fallback) {
  const apiError = err?.response?.data?.error;
  if (typeof apiError === 'string' && apiError.length > 0) return apiError;
  if (err?.message) return err.message;
  return fallback;
}
