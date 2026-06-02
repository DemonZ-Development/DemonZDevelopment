import { useEffect } from 'react';

interface MetaOptions {
  title: string;
  description?: string;
  image?: string;
  url?: string;
}

const DEFAULTS = {
  title: 'DemonZ Development — Open Source & AI Integration',
  description:
    'DemonZ Development — Crafting open source tools, plugins, and training artificial intelligence models.',
  image: 'https://demonzdevelopment.online/dzd-logo.jpeg',
  url: 'https://demonzdevelopment.online/',
};

/**
 * Sets document.title plus Open Graph / Twitter meta tags for SPA route
 * changes. Since the page is a single HTML document, this rewrites the
 * existing tags in place. Returns nothing; mounts/unmounts handle cleanup.
 */
export function useMeta({
  title,
  description = DEFAULTS.description,
  image = DEFAULTS.image,
  url = DEFAULTS.url,
}: MetaOptions): void {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    const setMeta = (selector: string, attr: string, content: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement('meta');
        const [key, value] = selector
          .replace(/[[\]"]/g, '')
          .split('=')
          .map((s) => s.trim());
        el.setAttribute(key, value);
        document.head.appendChild(el);
      }
      el.setAttribute(attr, content);
    };

    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:image"]', 'content', image);
    setMeta('meta[property="og:url"]', 'content', url);
    setMeta('meta[name="twitter:title"]', 'content', title);
    setMeta('meta[name="twitter:description"]', 'content', description);
    setMeta('meta[name="twitter:image"]', 'content', image);

    return () => {
      document.title = previousTitle;
    };
  }, [title, description, image, url]);
}
