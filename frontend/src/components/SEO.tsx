import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
}

export default function SEO({ 
  title = 'DemonZ Development', 
  description = 'Explore our open-source utilities, game releases, and modifications.', 
  image = 'https://demonz.org/logo.png',
  url = 'https://demonz.org',
  type = 'website',
  noindex = false
}: SEOProps) {
  const siteTitle = title.includes('DemonZ Development') ? title : `${title} | DemonZ Development`;
  
  return (
    <Helmet>
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex" />}
      
      {}
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      
      {}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
