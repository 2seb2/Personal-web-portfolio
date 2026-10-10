import type { Metadata } from 'next';
import { site } from '@/content/site';
import { getProjects } from '@/lib/projects';
import { ProjectCard } from '@/components/ui/ProjectCard';

export const metadata: Metadata = {
  title: `${site.pages.projects.title} · ${site.name}`,
  description: site.pages.projects.description,
};

export default function ProjectsPage() {
  const projects = getProjects();

  return (
    <div className="mx-auto flex w-full max-w-242 flex-col gap-14 px-6 pt-20 pb-30 md:px-14 md:pt-30 md:pb-40">
      <div className="flex flex-col gap-3">
        <h1 className="type-display-lg text-fg">{site.pages.projects.title}</h1>
        <p className="type-body-lg text-fg-secondary">{site.pages.projects.description}</p>
      </div>
      <div className="grid grid-cols-1 gap-7.5 pt-6.5 md:grid-cols-2">
        {projects.map((project, i) => (
          <ProjectCard key={project.slug} project={project} priority={i === 0} />
        ))}
      </div>
    </div>
  );
}
