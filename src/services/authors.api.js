import api from '../lib/axios';

export const authorsApi = {
  getAuthors: () => api.get('/authors').then(r => r.data),
  getAuthor: (id) => api.get(`/authors/${id}`).then(r => r.data),
  searchAuthors: (query) => api.get('/authors/search', { params: { q: query } }).then(r => r.data),
  createAuthor: (data) => api.post('/authors', data).then(r => r.data),
  updateAuthor: (id, data) => api.put(`/authors/${id}`, data).then(r => r.data),
  deleteAuthor: (id) => api.delete(`/authors/${id}`).then(r => r.data),
};
