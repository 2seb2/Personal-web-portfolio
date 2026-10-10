import { site } from '@/content/site';

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-378 px-6 py-10 md:px-14 md:py-16">
        <p className="type-heading-md md:type-heading-lg text-fg">{site.footer.heading}</p>
        <a
          href={`mailto:${site.email}`}
          className="type-heading-md md:type-heading-lg mt-2 inline-block text-brand-text"
        >
          {site.email}
        </a>
        <p className="type-body-sm mt-4 whitespace-pre-line text-fg-secondary">
          {site.footer.note}
        </p>
        <div className="mt-8 flex flex-wrap gap-4 md:gap-6">
          {site.footer.links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith('http') ? '_blank' : undefined}
              rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="type-mono-sm text-fg-secondary"
            >
              {link.label} ↗
            </a>
          ))}
        </div>
        <p className="type-mono-xs mt-8 text-fg-muted">{site.footer.copyright}</p>
      </div>
    </footer>
  );
}
