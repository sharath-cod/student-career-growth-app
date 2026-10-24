import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

// Sun in dark mode (click for light), moon in light mode (click for dark).
export default function ThemeToggle({ className = '' }) {
  const { isDark, toggle } = useTheme();
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';
  return (
    <button type="button" onClick={toggle} className={`icon-btn ${className}`} aria-label={label} title={label}>
      {isDark ? <Sun size={18} className="text-signal" aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>
  );
}
