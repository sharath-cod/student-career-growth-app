import { Check } from 'lucide-react';
import TextField from './TextField.jsx';

// Linked dropdowns: each step appears only after the previous one is chosen,
// and its options depend on that choice. Changing an earlier step clears the later ones.
export default function CareerChain({ form, onChange, options, errors }) {
  const steps = [
    { key: 'shortTermGoal', label: 'Short-term goal', list: () => Object.keys(options.goals) },
    { key: 'longTermGoal', label: 'Long-term goal', list: () => options.goals[form.shortTermGoal] || [] },
    { key: 'targetIndustry', label: 'Target industry', list: () => Object.keys(options.industries) },
    { key: 'targetDomain', label: 'Target domain', list: () => Object.keys(options.industries[form.targetIndustry] || {}) },
    { key: 'targetJobRole', label: 'Target job role', list: () => (options.industries[form.targetIndustry] || {})[form.targetDomain] || [] },
  ];

  function choose(index, value) {
    const patch = { [steps[index].key]: value };
    steps.slice(index + 1).forEach((s) => (patch[s.key] = ''));
    onChange(patch);
  }

  const visible = steps.filter((s, i) => i === 0 || form[steps[i - 1].key]);

  return (
    <ol className="space-y-5">
      {visible.map((step) => {
        const i = steps.indexOf(step);
        const done = Boolean(form[step.key]);
        return (
          <li key={step.key} className="flex gap-4">
            <div
              className={`mt-7 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                done ? 'bg-pine text-white' : 'border border-line bg-surface text-muted'
              }`}
              aria-hidden="true"
            >
              {done ? <Check size={14} /> : i + 1}
            </div>
            <TextField
              className="flex-1"
              label={`${i + 1}. ${step.label}`}
              options={step.list()}
              value={form[step.key]}
              onChange={(e) => choose(i, e.target.value)}
              error={errors[step.key]}
            />
          </li>
        );
      })}
      {visible.length < steps.length && <p className="pl-11 text-xs text-muted">Next: {steps[visible.length].label.toLowerCase()} appears after you choose above.</p>}
    </ol>
  );
}
