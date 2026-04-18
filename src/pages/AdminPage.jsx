import React, { useState, useEffect } from 'react';
import { Zap, Copy, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { enrichmentApi } from '../services/enrichment.api';

export function AdminPage() {
  const [activeTab, setActiveTab] = useState('enrichment');
  const [enrichmentLimit, setEnrichmentLimit] = useState('20');
  const [enrichmentLoading, setEnrichmentLoading] = useState(false);
  const [enrichmentStatus, setEnrichmentStatus] = useState(null);
  const [enrichmentResult, setEnrichmentResult] = useState(null);

  const [duplicatesLoading, setDuplicatesLoading] = useState(false);
  const [duplicates, setDuplicates] = useState(null);
  const [dryRunMode, setDryRunMode] = useState(true);
  const [duplicateResult, setDuplicateResult] = useState(null);

  // Load enrichment status on mount
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const status = await enrichmentApi.getStatus();
        setEnrichmentStatus(status);
      } catch (error) {
        console.error('Error loading enrichment status:', error);
      }
    };
    loadStatus();
  }, []);

  const handleRunEnrichment = async () => {
    setEnrichmentLoading(true);
    setEnrichmentResult(null);
    try {
      const limit = parseInt(enrichmentLimit) || 20;
      const result = await enrichmentApi.runEnrichment(limit);
      setEnrichmentResult(result);
      // Reload status
      const status = await enrichmentApi.getStatus();
      setEnrichmentStatus(status);
    } catch (error) {
      console.error('Error running enrichment:', error);
      setEnrichmentResult({
        error: 'Error al ejecutar enriquecimiento: ' + error.message,
      });
    } finally {
      setEnrichmentLoading(false);
    }
  };

  const handleFindDuplicates = async () => {
    setDuplicatesLoading(true);
    setDuplicates(null);
    try {
      const result = await enrichmentApi.getDuplicates();
      setDuplicates(result);
    } catch (error) {
      console.error('Error finding duplicates:', error);
      setDuplicates({
        error: 'Error al buscar duplicados: ' + error.message,
      });
    } finally {
      setDuplicatesLoading(false);
    }
  };

  const handleRemoveDuplicates = async () => {
    setDuplicatesLoading(true);
    setDuplicateResult(null);
    try {
      const result = await enrichmentApi.removeDuplicates(dryRunMode);
      setDuplicateResult(result);
      if (!dryRunMode) {
        // Reload duplicates list
        const freshDuplicates = await enrichmentApi.getDuplicates();
        setDuplicates(freshDuplicates);
      }
    } catch (error) {
      console.error('Error removing duplicates:', error);
      setDuplicateResult({
        error: 'Error al eliminar duplicados: ' + error.message,
      });
    } finally {
      setDuplicatesLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Panel de Administración
      </h1>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('enrichment')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'enrichment'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Enriquecimiento
        </button>
        <button
          onClick={() => setActiveTab('duplicates')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'duplicates'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Duplicados
        </button>
      </div>

      {/* Enrichment Tab */}
      {activeTab === 'enrichment' && (
        <div className="space-y-6">
          {/* Status Card */}
          {enrichmentStatus && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Estado de enriquecimiento
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    En cola
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {enrichmentStatus.queue_count || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Procesados
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {enrichmentStatus.processed_count || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Errores
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {enrichmentStatus.error_count || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Tasa de éxito
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {enrichmentStatus.success_rate
                      ? (enrichmentStatus.success_rate * 100).toFixed(1)
                      : 0}
                    %
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Enrichment Controls */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Ejecutar enriquecimiento
            </h3>

            <div className="mb-6">
              <Input
                label="Límite de libros a procesar"
                type="number"
                value={enrichmentLimit}
                onChange={(e) => setEnrichmentLimit(e.target.value)}
                placeholder="20"
                min="1"
                max="1000"
              />
            </div>

            <Button
              variant="primary"
              onClick={handleRunEnrichment}
              loading={enrichmentLoading}
              className="flex items-center gap-2"
            >
              <Zap className="w-5 h-5" />
              Ejecutar Enriquecimiento
            </Button>

            {enrichmentResult && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                {enrichmentResult.error ? (
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-900 dark:text-red-200">
                        Error
                      </p>
                      <p className="text-sm text-red-800 dark:text-red-300 mt-1">
                        {enrichmentResult.error}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900 dark:text-green-200">
                        Enriquecimiento completado
                      </p>
                      <div className="text-sm text-green-800 dark:text-green-300 mt-2 space-y-1">
                        <p>Libros procesados: {enrichmentResult.processed || 0}</p>
                        {enrichmentResult.enriched !== undefined && (
                          <p>Libros enriquecidos: {enrichmentResult.enriched}</p>
                        )}
                        {enrichmentResult.errors !== undefined && (
                          <p>Errores: {enrichmentResult.errors}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Duplicates Tab */}
      {activeTab === 'duplicates' && (
        <div className="space-y-6">
          {/* Find Duplicates Button */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Buscar duplicados
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Busca libros duplicados en la base de datos.
            </p>
            <Button
              variant="primary"
              onClick={handleFindDuplicates}
              loading={duplicatesLoading && !duplicates}
              className="flex items-center gap-2"
            >
              <Copy className="w-5 h-5" />
              Buscar Duplicados
            </Button>
          </Card>

          {/* Duplicates Results */}
          {duplicates && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Resultados
              </h3>

              {duplicates.error ? (
                <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900 dark:text-red-200">
                      Error
                    </p>
                    <p className="text-sm text-red-800 dark:text-red-300 mt-1">
                      {duplicates.error}
                    </p>
                  </div>
                </div>
              ) : duplicates.count > 0 ? (
                <div>
                  <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                      Se encontraron {duplicates.count} grupos de duplicados
                    </p>
                  </div>

                  {/* Duplicate Groups Table */}
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-2 px-3 font-semibold text-gray-900 dark:text-white">
                            Grupo
                          </th>
                          <th className="text-left py-2 px-3 font-semibold text-gray-900 dark:text-white">
                            Libros
                          </th>
                          <th className="text-left py-2 px-3 font-semibold text-gray-900 dark:text-white">
                            Similitud
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {duplicates.groups?.map((group, idx) => (
                          <tr
                            key={idx}
                            className="border-b border-gray-100 dark:border-gray-700"
                          >
                            <td className="py-2 px-3">#{idx + 1}</td>
                            <td className="py-2 px-3">
                              {group.count || group.books?.length || 0}
                            </td>
                            <td className="py-2 px-3">
                              {group.similarity
                                ? (group.similarity * 100).toFixed(1)
                                : 'N/A'}
                              %
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Remove Duplicates Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="dryRun"
                        checked={dryRunMode}
                        onChange={(e) => setDryRunMode(e.target.checked)}
                        className="w-4 h-4 text-purple-600 rounded"
                      />
                      <label
                        htmlFor="dryRun"
                        className="text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Modo de prueba (simular solo)
                      </label>
                    </div>

                    <Button
                      variant={dryRunMode ? 'secondary' : 'danger'}
                      onClick={handleRemoveDuplicates}
                      loading={duplicatesLoading && !!duplicates}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="w-5 h-5" />
                      {dryRunMode
                        ? 'Simular eliminación'
                        : 'Eliminar Duplicados'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm font-medium text-green-900 dark:text-green-200">
                    No se encontraron duplicados
                  </p>
                </div>
              )}
            </Card>
          )}

          {/* Duplicate Removal Result */}
          {duplicateResult && (
            <Card>
              <div className="space-y-2">
                {duplicateResult.error ? (
                  <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-900 dark:text-red-200">
                        Error
                      </p>
                      <p className="text-sm text-red-800 dark:text-red-300 mt-1">
                        {duplicateResult.error}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900 dark:text-green-200">
                        {dryRunMode ? 'Simulación completada' : 'Duplicados eliminados'}
                      </p>
                      <div className="text-sm text-green-800 dark:text-green-300 mt-2 space-y-1">
                        {duplicateResult.removed !== undefined && (
                          <p>
                            Duplicados {dryRunMode ? 'que se eliminarían' : 'eliminados'}:{' '}
                            {duplicateResult.removed}
                          </p>
                        )}
                        {duplicateResult.groups !== undefined && (
                          <p>Grupos procesados: {duplicateResult.groups}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
