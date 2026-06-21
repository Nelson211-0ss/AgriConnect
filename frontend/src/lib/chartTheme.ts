import { useTheme } from '@/context/ThemeContext';

export function useChartTheme() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return {
    grid: isDark ? '#334155' : '#eef2f6',
    tick: isDark ? '#94a3b8' : '#94a3b8',
    tickStrong: isDark ? '#cbd5e1' : '#64748b',
    legend: isDark ? '#cbd5e1' : '#64748b',
    tooltip: {
      contentStyle: {
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
        borderRadius: '12px',
        color: isDark ? '#f1f5f9' : '#1e293b',
      },
    },
  };
}
