import { useId } from 'react';

// Handles <input> and <select> (pass `options`) with a consistent label + error line.
export default function TextField({ label, error, hint, options, className = '', inputClassName = '', ...props }) {
  const id = useId();
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined;
  const cls = `input ${error ? 'input-error' : ''} ${inputClassName}`;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {options ? (
        <select id={id} className={cls} aria-invalid={Boolean(error)} aria-describedby={describedBy} {...props}>
          <option value="">Select…</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <input id={id} className={cls} aria-invalid={Boolean(error)} aria-describedby={describedBy} {...props} />
      )}
      {error ? (
        <p id={`${id}-err`} className="mt-1 text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
