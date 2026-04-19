import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useCreateAuthor, useUpdateAuthor } from '../../hooks/useAuthors';

export function AuthorForm({ isOpen, onClose, author = null }) {
  // Reset-on-prop-change pattern from
  // https://react.dev/reference/react/useState#storing-information-from-previous-renders
  // — track the previous `author`/`isOpen` and reset during render
  // instead of via useEffect+setState (which trips
  // `react-hooks/set-state-in-effect`).
  const [nombre, setNombre] = useState(author?.name || '');
  const [errors, setErrors] = useState({});
  const [prevAuthorId, setPrevAuthorId] = useState(author?.id ?? null);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (author?.id !== prevAuthorId || isOpen !== prevIsOpen) {
    setPrevAuthorId(author?.id ?? null);
    setPrevIsOpen(isOpen);
    setNombre(author?.name || '');
    setErrors({});
  }

  const createAuthorMutation = useCreateAuthor();
  const updateAuthorMutation = useUpdateAuthor();

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
