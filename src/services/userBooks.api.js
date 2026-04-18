import api from '../lib/axios';

export const userBooksApi = {
  getUserBooks: () => api.get('/user_books').then(r => r.data),
  getUserBooksWithDetails: (userId) => api.get(`/user_books/with-details/${userId}`).then(r => r.data),
  getUserBook: (id) => api.get(`/user_books/${id}`).then(r => r.data),
  addToCollection: (data) => api.post('/user_books', data).then(r => r.data),  // { user_id, book_id, reading_status, wishlist_status }
  updateUserBook: (id, data) => api.put(`/user_books/${id}`, data).then(r => r.data),
  removeFromCollection: (id) => api.delete(`/user_books/${id}`).then(r => r.data),
};
