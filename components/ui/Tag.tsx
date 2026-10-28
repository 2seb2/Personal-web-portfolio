type TagProps = {
  label: string;
  /** brand: 주황(기술 스택) · neutral: 회색(아티클 종류) */
  tone?: 'brand' | 'neutral';
};

const toneClassName = {
  brand: 'border-brand bg-brand/12 text-brand-text',
  neutral: 'border-line bg-sunken text-fg-secondary',
};

export function Tag({ label, tone = 'brand' }: TagProps) {
  return (
    <span className={`inline-flex items-center rounded-card border px-2 py-1 type-label-tag ${toneClassName[tone]}`}>
      {label}
    </span>
  );
}
