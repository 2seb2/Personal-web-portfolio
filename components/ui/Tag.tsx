type TagProps = {
  label: string;
};

export function Tag({ label }: TagProps) {
  return (
    <span className="inline-flex items-center rounded-card border border-brand bg-brand/12 px-2 py-1 type-label-tag text-brand-text">
      {label}
    </span>
  );
}
