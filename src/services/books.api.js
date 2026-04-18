import api from '../lib/axios';

export const booksApi = {
  getBooks: (params = {}) => api.get('/books', { params }).then(r => r.data),
  getBook: (id) => api.get(`/books/${id}`).then(r => r.data),
  searchBooks: (query) => api.get('/books/search', { params: { q: query } }).then(r => r.data),
  getPublicBooks: () => api.get('/books/public').then(r => r.data),
  getBooksByAuthor: (authorId) => api.get(`/books/by-author/${authorId}`).then(r => r.data),
  createBook: (data) => api.post('/books', data).then(r => r.data),
  updateBook: (id, data) => api.put(`/books/${id}`, data).then(r => r.data),
  deleteBook: (id) => api.delete(`/books/${id}`).then(r => r.data),
  uploadCover: (formData) => api.post('/books/upload-cover', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),
};
