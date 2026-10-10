import Image from 'next/image';
import type { Project, RichText } from '@/types/content';

type ProjectCardProps = {
  project: Project;
  priority?: boolean;
};

function renderRichText(text: RichText) {
  return text.map((part, i) =>
    typeof part === 'string' ? (
      <span key={i}>{part}</span>
    ) : (
      <span key={i} className="type-body-sm-strong text-fg">
        {part.strong}
      </span>
    ),
  );
}

export function ProjectCard({ project, priority = false }: ProjectCardProps) {
  const href = project.detail
    ? `/projects/${project.slug}`
    : (project.links?.github ?? project.links?.notion ?? '#');
  const isExternal = !project.detail;

  return (
    <a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className="group flex w-full max-w-117.25 flex-col rounded-card-lg border-[1.5px] border-transparent p-3 transition-[background-color,border-color,box-shadow] duration-200 hover:border-brand hover:bg-brand/8 hover:shadow-md"
    >
      <div className="relative aspect-890/704 w-full overflow-hidden rounded-card border border-line bg-surface">
        {project.thumbnail ? (
          <Image
            src={project.thumbnail.src}
            alt={project.thumbnail.alt}
            fill
            sizes="(min-width: 768px) 469px, 100vw"
            priority={priority}
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-sunken" />
        )}
      </div>
      <div className="flex w-full flex-col items-start px-1 pt-4">
        <div className="flex w-full items-start justify-between gap-4">
          <p className="type-mono-xs text-brand-text">
            {String(project.order).padStart(2, '0')} · {project.name}
          </p>
          <p className="type-mono-xs shrink-0 text-fg-muted">
            {project.period} · {project.team}
          </p>
        </div>
        <p className="type-heading-md pt-2 text-fg">{project.title}</p>
        <ul className="w-full list-disc pt-1.25 ps-5">
          {project.highlights.map((highlight, i) => (
            <li key={i} className="type-body-sm text-fg-secondary">
              {renderRichText(highlight)}
            </li>
          ))}
        </ul>
      </div>
    </a>
  );
}
