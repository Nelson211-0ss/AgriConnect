import { CHART_COLORS } from '@/components/common';

const COMMODITY_COLOR: Record<string, string> = {
  Maize: '#0B7A3E',
  Sorghum: '#F59E0B',
  Groundnuts: '#22C55E',
  Sesame: '#8B5CF6',
  Cassava: '#3B82F6',
  Millet: '#EC4899',
};

export function commodityColor(name: string, index = 0) {
  return COMMODITY_COLOR[name] || CHART_COLORS[index % CHART_COLORS.length];
}
