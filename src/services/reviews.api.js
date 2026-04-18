import api from '../lib/axios';

/**
 * Public Reviews API client.
 *
 * Reviews live in the `user_reviews` table and are distinct from the private
 * per-user note stored on `user_books.review`. One review per (user, book).
 *
 * Response shapes returned below are the full API envelope `{ success, data, timestamp }`.
 * Consumers unwrap `.data` (and `.data.reviews` for list endpoints).
 */
export const reviewsApi = {
  getByBook: (bookId, params = {}) =>
    api.get(`/reviews/by-book/${bookId}`, { params }).then((r) => r.data),
  getByUser: (userId) =>
    api.get(`/reviews/by-user/${userId}`).then((r) => r.data),
  getReview: (id) => api.get(`/reviews/${id}`).then((r) => r.data),
  createReview: (data) => api.post('/reviews', data).then((r) => r.data),
  updateReview: (id, data) => api.put(`/reviews/${id}`, data).then((r) => r.data),
  deleteReview: (id) => api.delete(`/reviews/${id}`).then((r) => r.data),
  markHelpful: (id) => api.post(`/reviews/${id}/helpful`).then((r) => r.data),
};
