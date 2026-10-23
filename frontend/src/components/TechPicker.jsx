import TextField from './TextField.jsx';

// Domain -> category -> skill, each step shown after the previous one is chosen.
// Writes domain / category / name into the form values.
export default function TechPicker({ values, set, errors, catalog, nameLabel = 'Skill' }) {
  const cat = catalog.techCatalog;
  const domain = values.domain;
  const categories = domain && domain !== 'Other' ? Object.keys(cat[domain] || {}) : [];
  const names = domain && values.category ? (cat[domain] || {})[values.category] || [] : [];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <TextField label="1. Domain" options={Object.keys(cat)} value={domain} error={errors.domain}
        onChange={(e) => { set('domain', e.target.value); set('category', e.target.value === 'Other' ? 'General Skills' : ''); set('name', ''); }} />
      {domain === 'Other' ? (
        <TextField label={`2. ${nameLabel} name`} className="sm:col-span-2" value={values.name} onChange={(e) => set('name', e.target.value)} error={errors.name || errors.category} />
      ) : (
        <>
          {domain ? <TextField label="2. Category" options={categories} value={values.category} error={errors.category} onChange={(e) => { set('category', e.target.value); set('name', ''); }} /> : <p className="self-end pb-2 text-xs text-muted sm:col-span-2">Choose a domain to see categories.</p>}
          {values.category && <TextField label={`3. ${nameLabel}`} options={names} value={values.name} error={errors.name} onChange={(e) => set('name', e.target.value)} />}
        </>
      )}
    </div>
  );
}
