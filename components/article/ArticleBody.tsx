import Image from 'next/image';
import Markdown, { type Components } from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import type { ArticleImageSizes } from '@/types/content';

type ArticleBodyProps = {
  body: string;
  imageSizes: ArticleImageSizes;
};

/** 제목 안의 **굵게**는 주황 대신 제목 색 그대로 */
const headingStrong = '[&_strong]:text-inherit';

function createComponents(imageSizes: ArticleImageSizes): Components {
  return {
    h1: ({ children }) => <h2 className={`mt-11 first:mt-0 type-heading-md text-fg ${headingStrong}`}>{children}</h2>,
    h2: ({ children }) => <h2 className={`mt-11 first:mt-0 type-heading-md text-fg ${headingStrong}`}>{children}</h2>,
    h3: ({ children }) => <h3 className={`mt-8 first:mt-0 type-body-md-strong text-fg ${headingStrong}`}>{children}</h3>,
    h4: ({ children }) => (
      <h4 className={`mt-6 first:mt-0 type-body-md-strong text-fg-secondary ${headingStrong}`}>{children}</h4>
    ),
    p: ({ children }) => <p className="mt-3 first:mt-0 type-body-md text-fg-strong">{children}</p>,
    strong: ({ children }) => <strong className="text-brand-text">{children}</strong>,
    a: ({ href, children }) => {
      const external = href?.startsWith('http');
      return (
        <a
          href={href}
          className="text-brand-text underline underline-offset-2"
          {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
        >
          {children}
        </a>
      );
    },
    ul: ({ children }) => (
      <ul className="mt-3 first:mt-0 list-disc ps-5 type-body-md text-fg-strong">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="mt-3 first:mt-0 list-decimal ps-5 type-body-md text-fg-strong">{children}</ol>
    ),
    li: ({ children }) => <li className="mt-1 first:mt-0 [&>ol]:mt-1 [&>ul]:mt-1">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="mt-3.5 first:mt-0 rounded-tr-img rounded-br-img border-l-3 border-brand bg-sunken px-4.5 py-4 type-body-md text-fg-strong">
        {children}
      </blockquote>
    ),
    pre: ({ children }) => (
      <pre className="mt-3 first:mt-0 overflow-x-auto rounded-img bg-sunken px-4.5 py-4 type-mono-sm text-fg-strong [&>code]:bg-transparent [&>code]:p-0">
        {children}
      </pre>
    ),
    code: ({ className, children }) => (
      <code className={`bg-sunken px-1 type-mono-sm text-fg ${className ?? ''}`}>{children}</code>
    ),
    table: ({ children }) => (
      <div className="mt-3 first:mt-0 overflow-x-auto">
        {/* 표 안에서는 단어 중간 줄바꿈(전역 overflow-wrap: anywhere)을 끄고, 넘치면 가로 스크롤 */}
        <table className="w-full border-collapse wrap-normal type-body-sm text-fg-strong">{children}</table>
      </div>
    ),
    th: ({ children }) => (
      <th className="border border-line bg-sunken px-3 py-2 text-left align-top type-body-sm-strong text-fg">
        {children}
      </th>
    ),
    td: ({ children }) => <td className="border border-line px-3 py-2 align-top">{children}</td>,
    hr: () => <hr className="mt-11 first:mt-0 border-line" />,
    // 이미지는 문단(p) 안에 들어오므로 figure 대신 span으로 쌓는다
    img: ({ src, alt }) => {
      const size = typeof src === 'string' ? imageSizes[src] : undefined;
      if (!size || typeof src !== 'string') return null;
      return (
        <span className="flex flex-col gap-2">
          <Image
            src={src}
            alt={alt ?? ''}
            width={size.width}
            height={size.height}
            sizes="(min-width: 768px) 820px, 100vw"
            className="h-auto max-w-full rounded-img"
          />
          {alt && <span className="type-mono-xs text-fg-muted">{alt}</span>}
        </span>
      );
    },
  };
}

/** 아티클 Markdown 본문 — 서버에서 렌더링. 노션에서 옮긴 HTML 주석(TODO)은 화면에 내지 않는다 */
export function ArticleBody({ body, imageSizes }: ArticleBodyProps) {
  return (
    <div>
      {/* 언어가 적힌 코드 블록만 강조 — 언어 없는 블록(트리·설명 텍스트)은 그대로 */}
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { detect: false }]]}
        skipHtml
        components={createComponents(imageSizes)}
      >
        {body}
      </Markdown>
    </div>
  );
}
