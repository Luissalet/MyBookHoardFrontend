import api from '../lib/axios';

export const sagasApi = {
  getSagas: () => api.get('/sagas').then(r => r.data),
  getSaga: (id) => api.get(`/sagas/${id}`).then(r => r.data),
  searchSagas: (query) => api.get('/sagas/search', { params: { q: query } }).then(r => r.data),
  getSagaBooks: (sagaId) => api.get(`/sagas/books/${sagaId}`).then(r => r.data),
  createSaga: (data) => api.post('/sagas', data).then(r => r.data),
  updateSaga: (id, data) => api.put(`/sagas/${id}`, data).then(r => r.data),
  deleteSaga: (id) => api.delete(`/sagas/${id}`).then(r => r.data),
  updateBookOrder: (sagaId, bookOrders) => api.post(`/sagas/order/${sagaId}`, { book_orders: bookOrders }).then(r => r.data),
};
