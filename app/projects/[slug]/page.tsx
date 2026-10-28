import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { getProjects, getProject, getNextProject, getProjectImages } from '@/lib/projects';
import { ProjectSection } from '@/components/project/ProjectSection';
import { LightboxProvider } from '@/features/lightbox/LightboxProvider';
import { LightboxTrigger } from '@/features/lightbox/LightboxTrigger';
import type { ProjectSlug } from '@/types/content';

export function generateStaticParams() {
  return getProjects()
    .filter((project) => project.detail)
    .map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<'/projects/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug as ProjectSlug);
  if (!project?.detail) return {};

  return {
    title: project.name,
    description: project.detail.summary,
  };
}

export default function ProjectDetailPage({ params }: PageProps<'/projects/[slug]'>) {
  return (
    <div className="mx-auto flex w-full max-w-242 flex-col items-center px-6 pt-12 pb-11 md:px-14">
      <div className="w-full max-w-205">
        <Link href="/projects" className="type-mono-sm text-fg-secondary">
          ← All projects
        </Link>

        <Suspense>
          <ProjectDetailContent params={params} />
        </Suspense>
      </div>
    </div>
  );
}

async function ProjectDetailContent({
  params,
}: Pick<PageProps<'/projects/[slug]'>, 'params'>) {
  const { slug } = await params;
  const project = getProject(slug as ProjectSlug);

  if (!project?.detail) {
    notFound();
  }

  const { detail } = project;
  const nextProject = getNextProject(project.slug);
  const { images, sectionStarts } = getProjectImages(detail);

  return (
    <LightboxProvider images={images}>
      <div className="flex flex-col pt-10 pb-9">
        <p className="type-mono-sm text-brand-text">{detail.eyebrow}</p>
        <h1 className="type-display-lg mt-3.5 text-fg">{detail.title}</h1>
        <p className="type-body-lg mt-3.5 text-fg-secondary">{detail.summary}</p>
      </div>

      <LightboxTrigger index={0} alt={detail.heroImage.alt} className="rounded-media">
        <span className="relative block w-full overflow-hidden rounded-media border border-line bg-surface">
          <Image
            src={detail.heroImage.src}
            alt={detail.heroImage.alt}
            width={detail.heroImage.width}
            height={detail.heroImage.height}
            className="w-full"
            priority
          />
        </span>
      </LightboxTrigger>

      <div className="mt-11 grid grid-cols-2 gap-y-6 border-t border-b border-line py-6.5 md:flex md:flex-wrap md:items-start md:justify-between md:gap-6">
        {detail.meta.map((item) => (
          <div key={item.term} className="flex min-w-0 flex-col pr-4 md:pr-0">
            <p className="type-mono-xs text-fg-secondary">{item.term}</p>
            <p className="type-body-sm-medium mt-1.25 text-fg">
              {item.value.map((line, i) => (
                <span key={i}>
                  {i > 0 && <br />}
                  {line}
                </span>
              ))}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-col">
        {detail.sections.map((section, i) => (
          <ProjectSection key={i} section={section} imageStartIndex={sectionStarts[i]} />
        ))}
      </div>

      <Link
        href={`/projects/${nextProject.slug}`}
        className="mt-11 flex w-full flex-col gap-1.5 rounded-next border border-line bg-surface px-6.5 py-6 transition-colors duration-200 hover:border-brand"
      >
        <p className="type-mono-sm text-brand-text">
          Next Project — {String(nextProject.order).padStart(2, '0')}
        </p>
        <p className="type-heading-md text-fg">{nextProject.title} →</p>
      </Link>
    </LightboxProvider>
  );
}
