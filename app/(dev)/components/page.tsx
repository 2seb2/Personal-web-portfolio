import { notFound } from 'next/navigation';
import { KeywordPill } from '@/components/ui/KeywordPill';
import { NavPill } from '@/components/ui/NavPill';
import { Tag } from '@/components/ui/Tag';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { TidyButton } from '@/components/ui/TidyButton';
import { projects } from '@/content/projects';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 border-b border-line py-10">
      <h2 className="type-heading-md text-fg">{title}</h2>
      <div className="flex flex-wrap items-center gap-6">{children}</div>
    </section>
  );
}

export default function ComponentsPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-300 flex-col px-14 py-10">
      <h1 className="type-display-lg text-fg">컴포넌트 확인용 페이지</h1>
      <p className="type-body-md mt-2 text-fg-secondary">
        /components — 프로덕션 빌드에서는 404가 됩니다.
      </p>

      <Section title="Keyword Pill">
        <KeywordPill label="다시 써보는" />
        <KeywordPill label="E2E로 검증하는" pressed />
      </Section>

      <Section title="Nav Pill">
        <NavPill label="프로젝트" href="/projects" />
        <NavPill label="아티클" href="/articles" />
      </Section>

      <Section title="Tag">
        <Tag label="CS" />
        <Tag label="Apollo Client" />
        <Tag label="React Query" />
      </Section>

      <Section title="Theme Toggle">
        <ThemeToggle />
      </Section>

      <Section title="Tidy Button">
        <TidyButton label="칩 정리하기" />
      </Section>

      <Section title="Project Card">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </Section>
    </div>
  );
}
