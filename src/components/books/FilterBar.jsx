import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { X } from 'lucide-react';

export function FilterBar({
  filters = {},
  onFilterChange,
  onClearFilters,
}) {
  const [expanded, setExpanded] = useState({
    status: true,
    wishlist: false,
    language: false,
    year: false,
    author: false,
    saga: false,
  });

  const toggleSection = (key) => {
    setExpanded((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleCheckboxChange = (key, value, checked) => {
    const current = filters[key] || [];
    let updated;

    if (checked) {
      updated = [...current, value];
    } else {
      updated = current.filter((v) => v !== value);
    }

    onFilterChange(key, updated.length > 0 ? updated : null);
  };

  const handleYearChange = (type, value) => {
    const current = filters.yearRange || {};
    const updated = {
      ...current,
      [type]: value ? parseInt(value) : null,
    };

    onFilterChange('yearRange', Object.values(updated).some(v => v !== null) ? updated : null);
  };

  const handleSearchChange = (key, value) => {
    onFilterChange(key, value || null);
  };

  const readingStatusOptions = [
    { value: 'not_started', label: 'Sin empezar' },
    { value: 'reading', label: 'Leyendo' },
    { value: 'completed', label: 'Leído' },
  ];

  const wishlistStatusOptions = [
    { value: 'wanted', label: 'Deseado' },
    { value: 'on_way', label: 'En camino' },
    { value: 'obtained', label: 'Obtenido' },
  ];

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

  const Section = ({ title, id, children }) => (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => toggleSection(id)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
        <span className={`text-gray-400 transition-transform ${expanded[id] ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {expanded[id] && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md h-fit sticky top-6">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h2 className="font-bold text-gray-900">Filtros</h2>
        {Object.values(filters).some(v => v) && (
          <button
            onClick={onClearFilters}
            className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Limpiar
          </button>
        )}
      </div>

      {/* Reading Status Filter */}
      <Section title="Estado de Lectura" id="status">
        <div className="space-y-3">
          {readingStatusOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={(filters.readingStatus || []).includes(option.value)}
                onChange={(e) =>
                  handleCheckboxChange('readingStatus', option.value, e.target.checked)
                }
                className="w-4 h-4 rounded border-gray-300 text-purple-600 cursor-pointer"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* Wishlist Filter */}
      <Section title="Estado de Deseo" id="wishlist">
        <div className="space-y-3">
          {wishlistStatusOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={(filters.wishlistStatus || []).includes(option.value)}
                onChange={(e) =>
                  handleCheckboxChange('wishlistStatus', option.value, e.target.checked)
                }
                className="w-4 h-4 rounded border-gray-300 text-purple-600 cursor-pointer"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* Language Filter */}
      <Section title="Idioma" id="language">
        <Select
          options={[{ value: '', label: 'Todos' }, ...languageOptions]}
          value={filters.language || ''}
          onChange={(e) => handleSearchChange('language', e.target.value)}
          className="text-sm"
        />
      </Section>

      {/* Year Range Filter */}
      <Section title="Año de Publicación" id="year">
        <div className="space-y-3">
          <Input
            type="number"
            placeholder="Año mín."
            value={filters.yearRange?.min || ''}
            onChange={(e) => handleYearChange('min', e.target.value)}
            className="text-sm"
          />
          <Input
            type="number"
            placeholder="Año máx."
            value={filters.yearRange?.max || ''}
            onChange={(e) => handleYearChange('max', e.target.value)}
            className="text-sm"
          />
        </div>
      </Section>

      {/* Author Filter */}
      <Section title="Autor" id="author">
        <Input
          type="text"
          placeholder="Buscar autor..."
          value={filters.author || ''}
          onChange={(e) => handleSearchChange('author', e.target.value)}
          className="text-sm"
        />
      </Section>

      {/* Saga Filter */}
      <Section title="Saga" id="saga">
        <Input
          type="text"
          placeholder="Buscar saga..."
          value={filters.saga || ''}
          onChange={(e) => handleSearchChange('saga', e.target.value)}
          className="text-sm"
        />
      </Section>

      {/* Clear Filters Button */}
      {Object.values(filters).some(v => v) && (
        <div className="px-4 py-3 border-t border-gray-200">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClearFilters}
            className="w-full"
          >
            Limpiar Filtros
          </Button>
        </div>
      )}
    </div>
  );
}
