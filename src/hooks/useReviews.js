import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsApi } from '../services/reviews.api';

/**
 * Query key conventions:
 *   ['reviews', 'by-book', bookId]   — list for a book
 *   ['reviews', 'by-user', userId]   — list for a user
 *   ['reviews', id]                  — single review
 *
 * After any write we invalidate the umbrella ['reviews'] prefix so both list
 * shapes stay fresh. Single-review caches are refreshed explicitly.
 *
 * Boundary normalization (lessons #6/#7/#8):
 *   The service `*.api.js` files do `.then(r => r.data)` which strips the
 *   axios wrapper but NOT the API envelope. Each `useQuery` here adds a
 *   `select` that unwraps the API envelope so consumers see the friendly
 *   shape (array for lists, plain object for `useReview`).
 *
 *   API envelope: `{ success, data: {...payload}, timestamp }`
 *     - GET /reviews/by-book/{id}  → data: { reviews: [...], total }
 *     - GET /reviews/by-user/{id}  → data: { reviews: [...], total }
 *     - GET /reviews/{id}          → data: { ...review fields }
 */
export function useBookReviews(bookId, params) {
  return useQuery({
    queryKey: ['reviews', 'by-book', bookId, params],
    queryFn: () => reviewsApi.getByBook(bookId, params),
    enabled: !!bookId,
    select: (envelope) => envelope?.data?.reviews ?? [],
  });
}

export function useUserReviews(userId) {
  return useQuery({
    queryKey: ['reviews', 'by-user', userId],
    queryFn: () => reviewsApi.getByUser(userId),
    enabled: !!userId,
    select: (envelope) => envelope?.data?.reviews ?? [],
  });
}

export function useReview(id) {
  return useQuery({
    queryKey: ['reviews', id],
    queryFn: () => reviewsApi.getReview(id),
    enabled: !!id,
    select: (envelope) => envelope?.data ?? null,
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reviewsApi.createReview,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews'] }),
  });
}

export function useUpdateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => reviewsApi.updateReview(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['reviews'] });
      qc.invalidateQueries({ queryKey: ['reviews', id] });
    },
  });
}

export function useDeleteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reviewsApi.deleteReview,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews'] }),
  });
}

export function useMarkReviewHelpful() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reviewsApi.markHelpful,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews'] }),
  });
}
