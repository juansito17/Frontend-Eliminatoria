'use client';

import { useState, useEffect } from 'react';
import { LaborTipo, CreateLaborTipoData, UpdateLaborTipoData } from '../hooks/useLaboresTipos';

interface LaborTipoFormProps {
  laborTipo?: LaborTipo | null; // Si es null o undefined, es para crear; si tiene datos, es para editar
  onSubmit: (data: CreateLaborTipoData | UpdateLaborTipoData) => Promise<boolean>;
  onCancel: () => void;
  loading?: boolean;
}

export const LaborTipoForm: React.FC<LaborTipoFormProps> = ({
  laborTipo = null,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState<CreateLaborTipoData>({
    nombre_labor: '',
    descripcion_labor: '',
    requiere_cantidad: false,
    requiere_peso: false,
  });

  const [errors, setErrors] = useState<Partial<CreateLaborTipoData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Si estamos editando, cargar los datos del tipo de labor
  useEffect(() => {
    if (laborTipo) {
      setFormData({
        nombre_labor: laborTipo.nombre_labor,
        descripcion_labor: laborTipo.descripcion_labor || '',
        requiere_cantidad: laborTipo.requiere_cantidad,
        requiere_peso: laborTipo.requiere_peso,
      });
    }
  }, [laborTipo]);

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateLaborTipoData> = {};

    if (!formData.nombre_labor.trim()) {
      newErrors.nombre_labor = 'El nombre es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CreateLaborTipoData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await onSubmit(
        laborTipo
          ? { ...formData, id_labor_tipo: laborTipo.id_labor_tipo }
          : formData
      );

      if (success) {
        // Resetear formulario si fue creación exitosa
        if (!laborTipo) {
          setFormData({
            nombre_labor: '',
            descripcion_labor: '',
            requiere_cantidad: false,
            requiere_peso: false,
          });
        }
      }
    } catch (error) {
      console.error('Error al enviar formulario:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing = !!laborTipo;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {isEditing ? 'Editar Tipo de Labor' : 'Agregar Nuevo Tipo de Labor'}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {isEditing
            ? 'Modifica la información del tipo de labor seleccionado.'
            : 'Ingresa la información del nuevo tipo de labor.'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre de la labor */}
        <div>
          <label htmlFor="nombre_labor" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de la Labor *
          </label>
          <input
            type="text"
            id="nombre_labor"
            value={formData.nombre_labor}
            onChange={(e) => handleInputChange('nombre_labor', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 ${
              errors.nombre_labor ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ej: Cosecha de café, Corte de caña..."
            disabled={isSubmitting || loading}
          />
          {errors.nombre_labor && (
            <p className="mt-1 text-sm text-red-600">{errors.nombre_labor}</p>
          )}
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="descripcion_labor" className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            id="descripcion_labor"
            rows={3}
            value={formData.descripcion_labor}
            onChange={(e) => handleInputChange('descripcion_labor', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
            placeholder="Describe brevemente en qué consiste esta labor..."
            disabled={isSubmitting || loading}
          />
        </div>

        {/* Opciones de configuración */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Configuración de la Labor</h3>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="requiere_cantidad"
              checked={formData.requiere_cantidad}
              onChange={(e) => handleInputChange('requiere_cantidad', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isSubmitting || loading}
            />
            <label htmlFor="requiere_cantidad" className="ml-2 block text-sm text-gray-700">
              Requiere registrar cantidad
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="requiere_peso"
              checked={formData.requiere_peso}
              onChange={(e) => handleInputChange('requiere_peso', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isSubmitting || loading}
            />
            <label htmlFor="requiere_peso" className="ml-2 block text-sm text-gray-700">
              Requiere registrar peso
            </label>
          </div>
        </div>

        {/* Información adicional para edición */}
        {isEditing && (
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>ID:</strong> {laborTipo.id_labor_tipo} |
              <strong> Creado:</strong> {new Date(laborTipo.fecha_creacion).toLocaleDateString('es-CO')}
            </p>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={isSubmitting || loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            disabled={isSubmitting || loading}
          >
            {isSubmitting && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isEditing ? 'Actualizar' : 'Crear'} Tipo de Labor
          </button>
        </div>
      </form>
    </div>
  );
};
