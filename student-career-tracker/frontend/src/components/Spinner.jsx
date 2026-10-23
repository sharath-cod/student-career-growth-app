export default function Spinner({ label = 'Loading' }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-label={label}>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-pine-light border-t-pine" />
    </div>
  );
}
