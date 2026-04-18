import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useCreateAuthor, useUpdateAuthor } from '../../hooks/useAuthors';

export function AuthorForm({ isOpen, onClose, author = null }) {
  const [nombre, setNombre] = useState('');
  const [errors, setErrors] = useState({});

  const createAuthorMutation = useCreateAuthor();
  const updateAuthorMutation = useUpdateAuthor();

  // Initialize form with author data when editing
  useEffect(() => {
    if (author) {
      setNombre(author.name || '');
    } else {
      setNombre('');
    }
    setErrors({});
  }, [author, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const payload = { name: nombre };

      if (author) {
        await updateAuthorMutation.mutateAsync({
          id: author.id,
          data: payload,
        });
      } else {
        await createAuthorMutation.mutateAsync(payload);
      }

      onClose();
    } catch (error) {
      console.error('Error saving author:', error);
    }
  };

  const handleChange = (e) => {
    setNombre(e.target.value);
    if (errors.nombre) {
      setErrors((prev) => ({
        ...prev,
        nombre: '',
      }));
    }
  };

  const isLoading = createAuthorMutation.isPending || updateAuthorMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={author ? 'Editar autor' : 'Nuevo autor'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre *"
          value={nombre}
          onChange={handleChange}
          error={errors.nombre}
          placeholder="Ej: Stephen King"
        />

        <div className="flex gap-3 justify-end pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
          >
            {author ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
