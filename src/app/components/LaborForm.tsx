'use client';

import { useState, useEffect } from 'react';
import { LaborAgricola, Cultivo, Trabajador, TipoLabor, Lote } from '../hooks/useLaboresAgricolas';
import { useToast } from './Toast';
import { useAuth } from '../context/AuthContext';

interface LaborFormProps {
  labor?: LaborAgricola | null;
  cultivos: Cultivo[];
  trabajadores: Trabajador[];
  tiposLabor: TipoLabor[];
  lotes: Lote[];
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  variant?: 'modal' | 'inline';
}

export default function LaborForm({ labor, cultivos, trabajadores, tiposLabor, lotes, onSubmit, onCancel, variant = 'modal' }: LaborFormProps) {

  const [formData, setFormData] = useState({
    fecha: labor?.fecha ? (labor.fecha.split('T')?.[0] || new Date().toISOString().split('T')[0]) : new Date().toISOString().split('T')[0],
    cultivoId: '',
    loteId: '',
    trabajadorId: '',
    tipoLaborId: '',
    cantidadRecolectada: labor?.cantidadRecolectada?.toString() || '',
    peso: labor?.peso?.toString() || '',
    hora: labor?.hora || new Date().toTimeString().slice(0, 5),
    ubicacionGPS: labor?.ubicacionGPS || ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);
  const [trabajadorSearch, setTrabajadorSearch] = useState('');

  const { showToast } = useToast();
  const { user } = useAuth();

  // Cuando cambian labor o listas maestro, intentar mapear nombres a IDs para edición y ajustar por rol
  useEffect(() => {
    if (!labor) {
      // Si no hay labor (crear nuevo), para operario asignar su trabajador si está disponible
      // Asignar si hay al menos 1 trabajador (no exigir exactamente 1)
      if (user?.rol === 3 && trabajadores.length > 0) {
        setFormData(prev => ({ ...prev, trabajadorId: String(trabajadores[0].id) }));
      }
      return;
    }

    // cultivar
    let cultivoId = '';
    const cultivoMatch = cultivos.find(c => c.nombre === (labor.cultivo || ''));
    if (cultivoMatch) cultivoId = String(cultivoMatch.id);

    // trabajador
    let trabajadorId = '';
    const trabajadorMatch = trabajadores.find(t => t.nombre === (labor.trabajador || ''));
    if (trabajadorMatch) trabajadorId = String(trabajadorMatch.id);
    // Si el usuario es operario y hay un trabajador en lista, forzarlo
    if (user?.rol === 3 && trabajadores.length === 1) {
      trabajadorId = String(trabajadores[0].id);
    }

    // tipo labor
    let tipoLaborId = '';
    const tipoMatch = tiposLabor.find(t => t.nombre_labor === (labor.tipoLabor || ''));
    if (tipoMatch) tipoLaborId = String(tipoMatch.id_labor_tipo);

    // lote
    let loteId = '';
    const loteMatch = lotes.find(l => l.nombre === (labor.lote || ''));
    if (loteMatch) loteId = String(loteMatch.id);

    setFormData({
      fecha: labor.fecha ? (labor.fecha.split('T')?.[0] || formData.fecha) : formData.fecha,
      cultivoId: cultivoId || formData.cultivoId,
      loteId: loteId || formData.loteId,
      trabajadorId: trabajadorId || formData.trabajadorId,
      tipoLaborId: tipoLaborId || formData.tipoLaborId,
      cantidadRecolectada: labor?.cantidadRecolectada?.toString() || formData.cantidadRecolectada,
      peso: labor?.peso?.toString() || formData.peso,
      hora: labor.hora || formData.hora,
      ubicacionGPS: labor?.ubicacionGPS || formData.ubicacionGPS
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labor, cultivos, trabajadores, tiposLabor, lotes, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Construir payload acorde al backend
      const payload: any = {
        id_lote: formData.loteId ? parseInt(formData.loteId) : null,
        id_cultivo: formData.cultivoId ? parseInt(formData.cultivoId) : null,
        id_trabajador: formData.trabajadorId ? parseInt(formData.trabajadorId) : null,
        id_labor_tipo: formData.tipoLaborId ? parseInt(formData.tipoLaborId) : null,
        // Unir fecha + hora en formato DATETIME simple
        fecha_labor: `${formData.fecha} ${formData.hora}:00`,
        cantidad_recolectada: formData.cantidadRecolectada ? parseFloat(formData.cantidadRecolectada) : null,
        peso_kg: formData.peso ? parseFloat(formData.peso) : null,
        costo_aproximado: null,
        ubicacion_gps_punto: formData.ubicacionGPS ? formData.ubicacionGPS : null,
        observaciones: ''
      };

      await onSubmit(payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocalización no es soportada por este navegador', 'error');
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = `${position.coords.latitude},${position.coords.longitude}`;
        setFormData({ ...formData, ubicacionGPS: coords });
        setLocating(false);
        showToast('Ubicación capturada', 'success');
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          showToast('Permiso denegado para acceder a la ubicación', 'error');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          showToast('Ubicación no disponible', 'error');
        } else if (error.code === error.TIMEOUT) {
          showToast('Tiempo de espera agotado al obtener ubicación', 'error');
        } else {
          showToast('No se pudo obtener la ubicación GPS', 'error');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const getMapUrls = (ubic: string | null) => {
    if (!ubic) return null;
    const parts = typeof ubic === 'string' ? ubic.split(',').map(p => p.trim()) : null;
    if (!parts || parts.length < 2) return null;
    const lat = parseFloat(parts[0]);
    const lon = parseFloat(parts[1]);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    const delta = 0.01;
    const minLat = lat - delta;
    const minLon = lon - delta;
    const maxLat = lat + delta;
    const maxLon = lon + delta;
    const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}&layer=mapnik&marker=${lat}%2C${lon}`;
    const osmLink = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`;
    return { lat, lon, embedUrl, osmLink };
  };

  const isModal = variant !== 'inline';

  return (
    <div className={isModal ? "fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center p-4 z-50" : ""}>
      <div className={isModal ? "bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" : "bg-white rounded-xl shadow-sm border border-gray-200 w-full"}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {labor ? 'Editar Labor' : 'Nueva Labor Agrícola'}
            </h3>
            {isModal && (
              <button
                onClick={onCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha
                </label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora
                </label>
                <input
                  type="time"
                  value={formData.hora}
                  onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cultivo
                </label>
                <select
                  value={formData.cultivoId}
                  onChange={(e) => setFormData({ ...formData, cultivoId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  required
                >
                  <option value="">Seleccionar cultivo</option>
                  {cultivos.map(cultivo => (
                    <option key={cultivo.id} value={cultivo.id}>{cultivo.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lote
                </label>
                <select
                  value={formData.loteId}
                  onChange={(e) => setFormData({ ...formData, loteId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  required
                >
                  <option value="">Seleccionar lote</option>
                  {lotes.map(lote => (
                    <option key={lote.id} value={lote.id}>{lote.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trabajador
                </label>

                {user?.rol === 3 ? (
                  <div>
                    <input
                      type="text"
                      value={trabajadores[0]?.nombre || user?.username || 'Sin trabajador asignado'}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
                    />
                    <input type="hidden" value={formData.trabajadorId} />
                  </div>
                ) : (
                  // Supervisor / Admin: search + select para mejor usabilidad con mini-avatars en opciones (visual)
                  <>
                    <div className="mb-2 flex gap-2">
                      <input
                        type="search"
                        value={trabajadorSearch}
                        onChange={(e) => setTrabajadorSearch(e.target.value)}
                        placeholder="Buscar trabajador por nombre..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                      />
                      <button
                        type="button"
                        onClick={() => { setTrabajadorSearch(''); setFormData(prev => ({ ...prev, trabajadorId: '' })); }}
                        className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm text-gray-600 hover:bg-gray-50"
                        title="Limpiar búsqueda"
                      >
                        Limpiar
                      </button>
                    </div>

                    <div className="relative">
                      <select
                        value={formData.trabajadorId}
                        onChange={(e) => setFormData({ ...formData, trabajadorId: e.target.value })}
                        className="w-full px-3 py-2 pl-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 appearance-none"
                        required
                      >
                        <option value="">Seleccionar trabajador</option>
                        {trabajadores
                          .filter(t => !trabajadorSearch || t.nombre.toLowerCase().includes(trabajadorSearch.toLowerCase()))
                          .map(trabajador => (
                            <option key={trabajador.id} value={trabajador.id}>{trabajador.nombre}</option>
                          ))
                        }
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {trabajadores.length === 0 && (
                      <p className="mt-2 text-xs text-gray-500">No hay trabajadores disponibles para tu rol.</p>
                    )}
                  </>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Labor
                </label>
                <select
                  value={formData.tipoLaborId}
                  onChange={(e) => setFormData({ ...formData, tipoLaborId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  required
                >
                  <option value="">Seleccionar tipo</option>
                  {tiposLabor.map(tipo => (
                    <option key={tipo.id_labor_tipo} value={tipo.id_labor_tipo}>{tipo.nombre_labor}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad Recolectada
                </label>
                <input
                  type="number"
                  value={formData.cantidadRecolectada}
                  onChange={(e) => setFormData({ ...formData, cantidadRecolectada: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  value={formData.peso}
                  onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación GPS (Opcional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.ubicacionGPS}
                  onChange={(e) => setFormData({ ...formData, ubicacionGPS: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500"
                  placeholder="Latitud, Longitud"
                />
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={locating}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${locating ? 'opacity-70 cursor-wait' : ''}`}
                >
                  {locating ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                      Capturando...
                    </span>
                  ) : (
                    'Capturar'
                  )}
                </button>
              </div>

              {(() => {
                const m = getMapUrls(formData.ubicacionGPS);
                if (!m) return null;
                return (
                  <div className="mt-3">
                    <div className="border rounded overflow-hidden">
                      <iframe
                        title="Mapa ubicación"
                        className="w-full h-48"
                        src={m.embedUrl}
                        style={{ border: 0 }}
                        loading="lazy"
                      />
                    </div>
                    <div className="mt-2 flex gap-3 items-center">
                      <a href={m.osmLink} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">
                        Abrir en OpenStreetMap
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          if (navigator.clipboard) {
                            navigator.clipboard.writeText(`${m.lat},${m.lon}`);
                            showToast('Coordenadas copiadas', 'success');
                          } else {
                            showToast('Tu navegador no soporta copiar al portapapeles', 'error');
                          }
                        }}
                        className="text-sm text-gray-700 hover:underline"
                      >
                        Copiar coordenadas
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Guardando...' : (labor ? 'Actualizar' : 'Guardar')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
