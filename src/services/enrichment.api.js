import api from '../lib/axios';

export const enrichmentApi = {
  getStatus: () => api.get('/enrichment/status').then(r => r.data),
  runEnrichment: (limit = 20) => api.post('/enrichment/run', { limit }).then(r => r.data),
  getDuplicates: () => api.get('/enrichment/duplicates').then(r => r.data),
  removeDuplicates: (dryRun = true) => api.post('/enrichment/duplicates/remove', { dry_run: dryRun }).then(r => r.data),
};
