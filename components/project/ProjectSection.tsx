import Image from 'next/image';
import { RichText } from '@/components/ui/RichText';
import type { ProjectSection as ProjectSectionType } from '@/types/content';

type ProjectSectionProps = {
  section: ProjectSectionType;
};

function Callout({ text }: { text: string }) {
  return (
    <div className="mt-3.5 rounded-tr-img rounded-br-img border-l-3 border-brand bg-sunken px-4.5 py-4 type-body-md text-fg-strong">
      {text}
    </div>
  );
}

export function ProjectSection({ section }: ProjectSectionProps) {
  return (
    <section className="flex w-full flex-col pt-11">
      <h2 className="type-heading-md text-fg">
        {section.index !== undefined && <span className="text-brand-text">{section.index}. </span>}
        {section.title}
      </h2>

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

      {section.image && (
        <div className="relative mt-3 h-125.75 w-full overflow-hidden rounded-img bg-sunken">
          <Image
            src={section.image.src}
            alt={section.image.alt}
            width={section.image.width}
            height={section.image.height}
            className="h-full w-full object-cover"
          />
        </div>
      )}

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
