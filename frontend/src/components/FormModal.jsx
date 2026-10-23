import { useState } from 'react';
import toast from 'react-hot-toast';
import { Modal } from './ui.jsx';
import TextField from './TextField.jsx';
import { parseError } from '../services/api.js';

const isEmpty = (v) => v === '' || v === undefined || v === null || (Array.isArray(v) && !v.length);

// Config-driven form in a modal.
// field: { name, label, type: text|number|date|url|email|select|textarea|tags|file|custom, options, required, min, max, step,
//          hint, span (1|2), readOnly, onChange(value, set), render({values, set, setMany, errors}) }
export default function FormModal({ title, fields, initial = {}, onSubmit, onClose, validate, submitLabel = 'Save', wide = false }) {
  const [values, setValues] = useState(() => ({ ...Object.fromEntries(fields.filter((f) => f.name).map((f) => [f.name, ''])), ...initial }));
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const set = (name, v) => setValues((o) => ({ ...o, [name]: v }));
  const setMany = (p) => setValues((o) => ({ ...o, ...p }));

  function check() {
    const e = {};
    fields.forEach((f) => {
      if (f.type === 'custom' || !f.name) return;
      const v = values[f.name];
      if (isEmpty(v)) { if (f.required) e[f.name] = `${f.label} is required`; return; }
      if (f.type === 'number') {
        const n = Number(v);
        if (Number.isNaN(n)) e[f.name] = 'Enter a number';
        else if (f.min !== undefined && n < f.min) e[f.name] = `${f.label} must be at least ${f.min}`;
        else if (f.max !== undefined && n > f.max) e[f.name] = `${f.label} must be at most ${f.max}`;
        else if (f.integer && !Number.isInteger(n)) e[f.name] = 'Enter a whole number';
      }
      if (f.type === 'url' && !/^https?:\/\/\S+\.\S+/.test(v)) e[f.name] = 'Enter a full link starting with https://';
      if (f.type === 'file' && v instanceof File && v.size > 2 * 1024 * 1024) e[f.name] = 'The file is larger than 2 MB';
    });
    return { ...e, ...(validate ? validate(values) : {}) };
  }

  async function submit(ev) {
    ev.preventDefault();
    const e = check();
    setErrors(e);
    if (Object.keys(e).length) { toast.error('Please fix the highlighted fields.'); return; }
    setBusy(true);
    try {
      await onSubmit(values);
      toast.success('Saved');
      onClose();
    } catch (err) {
      const { message, fieldErrors } = parseError(err);
      setErrors(fieldErrors);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={title} onClose={onClose} wide={wide}>
      <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        {fields.map((f, i) => {
          const span = f.span === 1 ? '' : 'sm:col-span-2';
          if (f.type === 'custom') return <div key={i} className="sm:col-span-2">{f.render({ values, set, setMany, errors })}</div>;
          if (f.type === 'file') {
            return (
              <div key={f.name} className={span}>
                <label className="mb-1.5 block text-sm font-medium" htmlFor={`f-${f.name}`}>{f.label}</label>
                <input id={`f-${f.name}`} type="file" accept={f.accept} className="input" onChange={(e) => set(f.name, e.target.files[0] || '')} />
                {errors[f.name] ? <p className="mt-1 text-xs text-danger">{errors[f.name]}</p> : f.hint ? <p className="mt-1 text-xs text-muted">{f.hint}</p> : null}
              </div>
            );
          }
          const common = {
            key: f.name, label: f.label, className: span, error: errors[f.name], hint: f.hint, value: values[f.name] ?? '', readOnly: f.readOnly,
            onChange: (e) => { set(f.name, e.target.value); if (f.onChange) f.onChange(e.target.value, set, values); },
          };
          if (f.type === 'select') return <TextField {...common} options={f.options} disabled={f.readOnly} />;
          if (f.type === 'textarea') return <TextField {...common} multiline />;
          const type = f.type === 'tags' ? 'text' : f.type || 'text';
          return <TextField {...common} type={type} min={f.min} max={f.max} step={f.step} inputMode={f.type === 'number' ? 'decimal' : undefined} inputClassName={f.readOnly ? 'bg-paper' : ''} />;
        })}
        <div className="mt-2 flex justify-end gap-3 sm:col-span-2">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary min-w-28" disabled={busy}>{busy ? 'Saving…' : submitLabel}</button>
        </div>
      </form>
    </Modal>
  );
}
