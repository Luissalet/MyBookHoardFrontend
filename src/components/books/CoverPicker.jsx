import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { coversApi } from '../../services/covers.api';
import { Loader2, ZoomIn } from 'lucide-react';

export function CoverPicker({
  isOpen,
  onClose,
  onSelect,
  initialTitle = '',
  initialAuthor = '',
  initialIsbn = '',
}) {
  const [searchParams, setSearchParams] = useState({
    title: initialTitle,
    author: initialAuthor,
    isbn: initialIsbn,
  });

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCover, setSelectedCover] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleSearch = async () => {
    if (!searchParams.title && !searchParams.author && !searchParams.isbn) {
      return;
    }

    setLoading(true);
    setResults([]);
    setSelectedCover(null);
    setPreviewUrl(null);

    try {
      const response = await coversApi.searchCovers(searchParams);
      setResults(response.results || []);
    } catch (error) {
      console.error('Error searching covers:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCover = (cover) => {
    setSelectedCover(cover);
    setPreviewUrl(cover.cover_url);
  };

  const handleConfirmSelection = () => {
    if (selectedCover && previewUrl) {
      onSelect(previewUrl);
      handleClose();
    }
  };

  const handleClose = () => {
    setSearchParams({
      title: initialTitle,
      author: initialAuthor,
      isbn: initialIsbn,
    });
    setResults([]);
    setSelectedCover(null);
    setPreviewUrl(null);
    onClose();
  };

  const getConfidenceVariant = (confidence) => {
    if (confidence >= 75) return 'success';
    if (confidence >= 50) return 'warning';
    return 'danger';
  };

  const confidenceColor = (confidence) => {
    if (confidence >= 75) return 'bg-green-100 text-green-800';
    if (confidence >= 50) return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Buscar Portada de Libro"
      size="xl"
    >
      <div className="space-y-4">
        {/* Search Form */}
        <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Título"
              value={searchParams.title}
              onChange={(e) =>
                setSearchParams((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Ingrese el título..."
            />
            <Input
              label="Autor"
              value={searchParams.author}
              onChange={(e) =>
                setSearchParams((prev) => ({ ...prev, author: e.target.value }))
              }
              placeholder="Ingrese el autor..."
            />
            <Input
              label="ISBN"
              value={searchParams.isbn}
              onChange={(e) =>
                setSearchParams((prev) => ({ ...prev, isbn: e.target.value }))
              }
              placeholder="Ingrese el ISBN..."
            />
          </div>

          <Button
            onClick={handleSearch}
            disabled={loading || (!searchParams.title && !searchParams.author && !searchParams.isbn)}
            loading={loading}
            className="w-full"
          >
            Buscar
          </Button>
        </div>

        {/* Preview Section */}
        {previewUrl && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Vista Previa</h3>
            <div className="flex justify-center">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-xs max-h-96 rounded-lg shadow-md"
              />
            </div>
            {selectedCover && (
              <div className="mt-3 text-center">
                <p className="text-sm text-gray-700 mb-2">{selectedCover.title}</p>
                <p className="text-xs text-gray-500 mb-3">{selectedCover.source}</p>
                <Button
                  onClick={handleConfirmSelection}
                  variant="primary"
                  className="w-full"
                >
                  Usar esta portada
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Results Grid */}
        {results.length > 0 && !previewUrl && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Resultados ({results.length})
            </h3>
            <div className="grid grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {results.map((cover, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectCover(cover)}
                  className="group relative flex flex-col items-center"
                >
                  <div className="relative w-full aspect-[3/4] bg-gray-200 rounded-lg overflow-hidden mb-2 hover:ring-2 hover:ring-purple-500 transition-all">
                    <img
                      src={cover.cover_url}
                      alt={cover.title}
                      className="w-full h-full object-cover group-hover:opacity-75"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                      <ZoomIn className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Confidence Badge */}
                  <Badge
                    className={`text-xs ${confidenceColor(cover.confidence)}`}
                  >
                    {cover.confidence}%
                  </Badge>

                  {/* Source */}
                  <p className="text-xs text-gray-600 text-center mt-2 line-clamp-2">
                    {cover.source}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
              <p className="text-sm text-gray-600">Buscando portadas...</p>
            </div>
          </div>
        )}

        {/* No Results State */}
        {!loading && results.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">
              {Object.values(searchParams).some((v) => v)
                ? 'No se encontraron portadas. Intente con otros términos.'
                : 'Ingrese un título, autor o ISBN para buscar.'}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
