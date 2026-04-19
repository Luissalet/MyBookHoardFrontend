import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { useCreateSaga, useUpdateSaga } from '../../hooks/useSagas';
import { useAuthors } from '../../hooks/useAuthors';

export function SagaForm({ isOpen, onClose, saga = null }) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripción: '',
    autor: '',
  });

  const [errors, setErrors] = useState({});
  const createSagaMutation = useCreateSaga();
  const updateSagaMutation = useUpdateSaga();
  const { data: authors = [] } = useAuthors();

  // Initialize form with saga data when editing.
  //
  // NOTE: the DB column is `primary_author_id` (sagas.primary_author_id);
  // the API returns it under that exact key. This form previously read
  // `saga.author_id`, which is undefined, so the author dropdown always
  // started blank when editing.
  useEffect(() => {
    if (saga) {
      setFormData({
        nombre: saga.name || '',
        descripción: saga.description || '',
        autor: saga.primary_author_id?.toString() || '',
      });
    } else {
      setFormData({
        nombre: '',
        descripción: '',
        autor: '',
      });
    }
    setErrors({});
  }, [saga, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) {
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
      // Match the API column names exactly — `Saga::create/update` reads
      // `primary_author_id`, not `author_id`. Posting `author_id` was a
      // no-op that silently dropped the author.
      const payload = {
        name: formData.nombre,
        description: formData.descripción,
        primary_author_id: formData.autor ? parseInt(formData.autor, 10) : null,
      };

      if (saga) {
        await updateSagaMutation.mutateAsync({
          id: saga.id,
          data: payload,
        });
      } else {
        await createSagaMutation.mutateAsync(payload);
      }

      onClose();
    } catch (error) {
      console.error('Error saving saga:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const isLoading = createSagaMutation.isPending || updateSagaMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={saga ? 'Editar saga' : 'Nueva saga'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre *"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          error={errors.nombre}
          placeholder="Ej: Harry Potter"
        />

        <Input
          label="Descripción"
          name="descripción"
          value={formData.descripción}
          onChange={handleChange}
          placeholder="Descripción opcional de la saga"
        />

        <Select
          label="Autor"
          name="autor"
          value={formData.autor}
          onChange={handleChange}
          options={[
            { value: '', label: 'Sin autor' },
            ...authors.map((author) => ({
              value: author.id.toString(),
              label: author.name,
            })),
          ]}
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
            {saga ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
