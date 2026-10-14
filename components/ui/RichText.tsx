import type { RichText as RichTextType } from '@/types/content';

const STRONG_CLASS = {
  /** 카드 글머리표: 굵게만, 색 없음 */
  card: 'type-body-sm-strong text-fg',
  /** 상세 블록 본문: 굵게 + brand-text */
  detail: 'type-body-md-strong text-brand-text',
} as const;

type RichTextProps = {
  text: RichTextType;
  variant: keyof typeof STRONG_CLASS;
};

export function RichText({ text, variant }: RichTextProps) {
  return (
    <>
      {text.map((part, i) =>
        typeof part === 'string' ? (
          <span key={i}>{part}</span>
        ) : (
          <span key={i} className={STRONG_CLASS[variant]}>
            {part.strong}
          </span>
        ),
      )}
    </>
  );
}
