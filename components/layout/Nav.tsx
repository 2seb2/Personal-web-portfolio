import Link from 'next/link';
import { site } from '@/content/site';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { HomeLink } from './HomeLink';

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-page/85 backdrop-blur-sm">
      <div className="mx-auto flex h-14.25 max-w-378 items-center justify-between px-6 md:px-14">
        <HomeLink label={site.name} />
        <div className="flex items-center gap-4 md:gap-8">
          {site.nav.map((item) => (
            <Link key={item.href} href={item.href} className="type-body-sm-medium text-fg">
              {item.label}
            </Link>
          ))}
          <a
            href={`mailto:${site.email}`}
            className="type-mono-sm hidden text-fg-secondary md:inline"
          >
            {site.email}
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
