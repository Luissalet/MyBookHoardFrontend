import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, ImageOff } from 'lucide-react';
import { useBook, useUpdateBook } from '../hooks/useBooks';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { CoverPicker } from '../components/books/CoverPicker';
import { useToast } from '../components/ui/Toast';

export function EditBookPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: book, isLoading: loadingBook } = useBook(id);
  const updateBook = useUpdateBook();

  const [formData, setFormData] = useState({
    title: '',
    author_name: '',
    description: '',
    publication_year: '',
    language: 'es',
    isbn: '',
    public: false,
    saga_name: '',
    saga_order: '',
    cover_url: '',
  });

  const [errors, setErrors] = useState({});
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [coverPreview, setCoverPreview] = useState(null);

  // Populate form with book data when loaded
  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || '',
        author_name: book.author_name || '',
        description: book.description || '',
        publication_year: book.publication_year || '',
        language: book.language || 'es',
        isbn: book.isbn || '',
        public: book.public || false,
        saga_name: book.saga?.name || '',
        saga_order: book.saga_order || '',
        cover_url: book.cover_selected || '',
      });
      setCoverPreview(book.cover_selected || book.images?.[0] || null);
    }
  }, [book]);

  const languageOptions = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'Inglés' },
    { value: 'fr', label: 'Francés' },
    { value: 'de', label: 'Alemán' },
    { value: 'it', label: 'Italiano' },
    { value: 'pt', label: 'Portugués' },
    { value: 'ja', label: 'Japonés' },
    { value: 'zh', label: 'Chino' },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }

    if (formData.publication_year && isNaN(parseInt(formData.publication_year))) {
      newErrors.publication_year = 'El año debe ser un número válido';
    }

    if (formData.saga_order && isNaN(parseInt(formData.saga_order))) {
      newErrors.saga_order = 'El número de saga debe ser un número válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCoverSelect = (coverUrl) => {
    setFormData((prev) => ({
      ...prev,
      cover_url: coverUrl,
    }));
    setCoverPreview(coverUrl);
    setShowCoverPicker(false);
    toast.success('Portada seleccionada');
  };

  const handleCoverUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result;
        setCoverPreview(dataUrl);
        setFormData((prev) => ({
          ...prev,
          cover_url: dataUrl,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Prepare data for submission
      const submitData = {
        title: formData.title.trim(),
        author_name: formData.author_name.trim() || null,
        description: formData.description.trim() || null,
        publication_year: formData.publication_year ? parseInt(formData.publication_year) : null,
        language: formData.language,
        isbn: formData.isbn.trim() || null,
        public: formData.public,
        cover_url: formData.cover_url || null,
      };

      // Add saga info if provided
      if (formData.saga_name.trim()) {
        submitData.saga_name = formData.saga_name.trim();
        submitData.saga_order = formData.saga_order ? parseInt(formData.saga_order) : null;
      }

      await updateBook.mutateAsync({
        id,
        data: submitData,
      });
      toast.success('Libro actualizado exitosamente');
      navigate(`/libros/${id}`);
    } catch (error) {
      console.error('Error updating book:', error);
      toast.error('Error al actualizar el libro');
    }
  };

  if (loadingBook) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate('/libros')}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-700">El libro no fue encontrado.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate(`/libros/${id}`)}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al libro
        </button>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Editar Libro</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <Input
              label="Título *"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Ej: El Quijote"
              error={errors.title}
            />

            {/* Author */}
            <Input
              label="Autor"
              type="text"
              name="author_name"
              value={formData.author_name}
              onChange={handleInputChange}
              placeholder="Ej: Miguel de Cervantes"
            />

            {/* Publication Year */}
            <Input
              label="Año de Publicación"
              type="number"
              name="publication_year"
              value={formData.publication_year}
              onChange={handleInputChange}
              placeholder="Ej: 1605"
              error={errors.publication_year}
            />

            {/* Language */}
            <Select
              label="Idioma"
              name="language"
              value={formData.language}
              onChange={handleInputChange}
              options={languageOptions}
            />

            {/* ISBN */}
            <Input
              label="ISBN"
              type="text"
              name="isbn"
              value={formData.isbn}
              onChange={handleInputChange}
              placeholder="Ej: 978-3-16-148410-0"
            />

            {/* Description */}
            <div className="w-full">
              <label className="block mb-2 text-sm font-medium text-gray-900">
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe el contenido del libro..."
                rows="5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
              />
            </div>

            {/* Cover Section */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Portada del Libro</h2>

              <div className="space-y-4">
                {/* Cover Preview */}
                {coverPreview && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Vista Previa</h3>
                    <div className="flex justify-center">
                      <img
                        src={coverPreview}
                        alt="Cover preview"
                        className="max-w-xs max-h-64 rounded-lg shadow-md object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Cover Upload Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Upload from File */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      className="hidden"
                      id="cover-upload"
                    />
                    <label
                      htmlFor="cover-upload"
                      className="flex flex-col items-center justify-center cursor-pointer"
                    >
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm font-medium text-gray-700">
                        Subir Portada
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        PNG, JPG, GIF
                      </span>
                    </label>
                  </div>

                  {/* Search Online */}
                  <button
                    type="button"
                    onClick={() => setShowCoverPicker(true)}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors flex flex-col items-center justify-center"
                  >
                    <ImageOff className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Buscar en línea
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      Usa Google Books o similares
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Saga Section */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Información de Saga (Opcional)</h2>

              <div className="space-y-4">
                <Input
                  label="Nombre de la Saga"
                  type="text"
                  name="saga_name"
                  value={formData.saga_name}
                  onChange={handleInputChange}
                  placeholder="Ej: Harry Potter"
                />

                <Input
                  label="Número en la Saga"
                  type="number"
                  name="saga_order"
                  value={formData.saga_order}
                  onChange={handleInputChange}
                  placeholder="Ej: 1"
                  error={errors.saga_order}
                />
              </div>
            </div>

            {/* Public Toggle */}
            <div className="border-t border-gray-200 pt-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="public"
                  checked={formData.public}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-gray-300 text-purple-600 cursor-pointer"
                />
                <span className="text-sm text-gray-700">
                  Hacer público este libro (visible para otros usuarios)
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="border-t border-gray-200 pt-6 flex gap-4">
              <Button
                type="submit"
                disabled={updateBook.isPending}
                loading={updateBook.isPending}
                className="flex-1"
              >
                Guardar Cambios
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(`/libros/${id}`)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Cover Picker Modal */}
      <CoverPicker
        isOpen={showCoverPicker}
        onClose={() => setShowCoverPicker(false)}
        onSelect={handleCoverSelect}
        initialTitle={formData.title}
        initialAuthor={formData.author_name}
        initialIsbn={formData.isbn}
      />
    </div>
  );
}
