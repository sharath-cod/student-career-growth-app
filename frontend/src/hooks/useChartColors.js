import { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext.jsx';

// Recharts takes colours as props (not classes), so give it theme-aware values.
export default function useChartColors() {
  const { isDark } = useTheme();
  return useMemo(() => {
    const c = isDark
      ? { grid: '#263633', axis: '#96A7A1', a: '#34B394', b: '#F0B742', tipBg: '#131C1A', tipBorder: '#283633', tipText: '#E8EEEB', cursor: 'rgba(255,255,255,0.06)' }
      : { grid: '#D8DDD6', axis: '#5E6B66', a: '#0F5C4D', b: '#E3A32B', tipBg: '#FFFFFF', tipBorder: '#D8DDD6', tipText: '#17211F', cursor: 'rgba(15,92,77,0.06)' };
    return {
      ...c,
      axis_tick: { fontSize: 12, fill: c.axis },
      tooltip: {
        contentStyle: { background: c.tipBg, border: `1px solid ${c.tipBorder}`, borderRadius: 8, color: c.tipText, fontSize: 13 },
        labelStyle: { color: c.tipText, fontWeight: 600 },
        itemStyle: { color: c.tipText },
        cursor: { stroke: c.grid, fill: c.cursor },
      },
    };
  }, [isDark]);
}
