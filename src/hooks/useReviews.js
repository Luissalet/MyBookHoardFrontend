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
 */
export function useBookReviews(bookId, params) {
  return useQuery({
    queryKey: ['reviews', 'by-book', bookId, params],
    queryFn: () => reviewsApi.getByBook(bookId, params),
    enabled: !!bookId,
  });
}

export function useUserReviews(userId) {
  return useQuery({
    queryKey: ['reviews', 'by-user', userId],
    queryFn: () => reviewsApi.getByUser(userId),
    enabled: !!userId,
  });
}

export function useReview(id) {
  return useQuery({
    queryKey: ['reviews', id],
    queryFn: () => reviewsApi.getReview(id),
    enabled: !!id,
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
