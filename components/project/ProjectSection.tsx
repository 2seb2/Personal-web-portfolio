import type { ReactNode } from 'react';
import Image from 'next/image';
import { RichText } from '@/components/ui/RichText';
import { LightboxTrigger } from '@/features/lightbox/LightboxTrigger';
import type { ProjectSection as ProjectSectionType } from '@/types/content';

type ProjectSectionProps = {
  section: ProjectSectionType;
  /** 이 섹션 첫 이미지의 갤러리 순서 (getProjectImages의 sectionStarts) */
  imageStartIndex: number;
  /** 섹션 제목 바로 오른쪽에 붙는 요소 (Overview의 외부 링크 아이콘) */
  titleAside?: ReactNode;
};

function Callout({ text }: { text: string }) {
  return (
    <div className="mt-3.5 rounded-tr-img rounded-br-img border-l-3 border-brand bg-sunken px-4.5 py-4 type-body-md text-fg-strong">
      {text}
    </div>
  );
}

export function ProjectSection({ section, imageStartIndex, titleAside }: ProjectSectionProps) {
  return (
    <section className="flex w-full flex-col pt-11">
      <div className="flex items-center gap-1">
        <h2 className="type-heading-md text-fg">
          {section.index !== undefined && <span className="text-brand-text">{section.index}. </span>}
          {section.title}
        </h2>
        {titleAside}
      </div>

      {section.paragraphs?.map((paragraph, i) => (
        <p key={i} className="mt-3 type-body-md text-fg-strong">
          {paragraph}
        </p>
      ))}

      {section.blocks?.map((block, i) => (
        <p key={i} className="mt-3.5 type-body-md text-fg-strong first:mt-3">
          <span className="type-body-md-strong text-brand-text">{block.label} </span>
          {typeof block.text === 'string' ? block.text : <RichText text={block.text} variant="detail" />}
        </p>
      ))}

      {section.image?.map((image, i) => (
        <LightboxTrigger key={i} index={imageStartIndex + i} alt={image.alt} className="mt-3 w-full rounded-img">
          <span className="relative block w-full overflow-hidden rounded-img bg-sunken">
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              className="w-full"
            />
          </span>
        </LightboxTrigger>
      ))}

      {section.callout && <Callout text={section.callout} />}

      {section.list && (
        <ul className="mt-3 list-disc ps-4.5">
          {section.list.map((item, i) => (
            <li key={i} className="type-body-md text-fg-strong">
              {item}
            </li>
          ))}
        </ul>
      )}

      {section.note && (
        <p className="mt-3.5 type-body-md text-fg-strong">
          <span className="type-body-md-strong text-brand-text">{section.note.label} </span>
          {section.note.text}
        </p>
      )}
    </section>
  );
}
