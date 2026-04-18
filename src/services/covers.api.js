import api from '../lib/axios';

export const coversApi = {
  searchCovers: (params) => api.get('/covers/search', { params }).then(r => r.data),
  // params: { title, author, isbn }
};
