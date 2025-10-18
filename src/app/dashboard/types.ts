export interface RendimientoItem {
  nombre_lote: string;
  peso_total_lote: number;
}

export interface DashboardData {
  total_peso_kg: number;
  trabajadores_activos: number;
  cultivos_activos: number;
  eficiencia_porcentaje: number;
  rendimiento_por_lote: RendimientoItem[];
  costo_total_aproximado: number;
}

export interface HistoricalData {
  periodo: string;
  total_peso_kg: number;
  trabajadores_unicos: number;
  productividad_promedio_dia: number;
  costo_total_aproximado: number;
}
