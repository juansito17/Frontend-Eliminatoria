import React, { useState, useEffect } from 'react';

interface Trabajador {
  id: number;
  nombre_completo: string;
  codigo_trabajador: string;
  activo: boolean;
  fecha_creacion: string;
}

interface TrabajadorFormProps {
  trabajador?: Trabajador | null;
  onSubmit: (trabajadorData: Omit<Trabajador, 'id' | 'fecha_creacion'>) => void;
  onClose: () => void;
}

const TrabajadorForm: React.FC<TrabajadorFormProps> = ({
  trabajador,
  onSubmit,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    nombre_completo: '',
    codigo_trabajador: '',
    activo: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar datos del trabajador si estamos editando
  useEffect(() => {
    if (trabajador) {
      setFormData({
        nombre_completo: trabajador.nombre_completo,
        codigo_trabajador: trabajador.codigo_trabajador,
        activo: trabajador.activo,
      });
    }
  }, [trabajador]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre_completo.trim()) {
      newErrors.nombre_completo = 'El nombre completo es requerido';
    }

    if (!formData.codigo_trabajador.trim()) {
      newErrors.codigo_trabajador = 'El código de trabajador es requerido';
    } else if (formData.codigo_trabajador.length < 3) {
      newErrors.codigo_trabajador = 'El código debe tener al menos 3 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error al guardar trabajador:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const isEditing = !!trabajador;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {isEditing ? 'Editar Trabajador' : 'Nuevo Trabajador'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre completo */}
            <div>
              <label htmlFor="nombre_completo" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo *
              </label>
              <input
                type="text"
                id="nombre_completo"
                value={formData.nombre_completo}
                onChange={(e) => handleInputChange('nombre_completo', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.nombre_completo ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ingrese el nombre completo del trabajador"
              />
              {errors.nombre_completo && (
                <p className="mt-1 text-sm text-red-600">{errors.nombre_completo}</p>
              )}
            </div>

            {/* Código de trabajador */}
            <div>
              <label htmlFor="codigo_trabajador" className="block text-sm font-medium text-gray-700 mb-1">
                Código de Trabajador *
              </label>
              <input
                type="text"
                id="codigo_trabajador"
                value={formData.codigo_trabajador}
                onChange={(e) => handleInputChange('codigo_trabajador', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.codigo_trabajador ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ingrese el código único del trabajador"
              />
              {errors.codigo_trabajador && (
                <p className="mt-1 text-sm text-red-600">{errors.codigo_trabajador}</p>
              )}
            </div>

            {/* Estado (solo visible en edición) */}
            {isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => handleInputChange('activo', !formData.activo)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                      formData.activo ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.activo ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="ml-3 text-sm text-gray-700">
                    {formData.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TrabajadorForm;
