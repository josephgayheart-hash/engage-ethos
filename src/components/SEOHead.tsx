import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  canonicalUrl?: string;
  keywords?: string[];
  noIndex?: boolean;
}

/**
 * SEOHead - Manages document head meta tags for SEO
 * 
 * Usage:
 * <SEOHead 
 *   title="Page Title" 
 *   description="Page description under 160 chars" 
 * />
 */
export function SEOHead({
  title = 'CampusVoice.AI - Strategic Messaging Intelligence for Higher Education',
  description = 'Plan, strategize, and execute brand-aligned communications at scale. Research-driven messaging intelligence built for higher education.',
  ogImage = '/og-image.png',
  ogType = 'website',
  canonicalUrl,
  keywords = ['higher education', 'communications', 'brand messaging', 'AI', 'enrollment marketing'],
  noIndex = false,
}: SEOHeadProps) {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Helper to update or create meta tag
    const updateMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Basic SEO meta tags
    updateMeta('description', description);
    updateMeta('keywords', keywords.join(', '));
    
    // Robots
    if (noIndex) {
      updateMeta('robots', 'noindex, nofollow');
    } else {
      updateMeta('robots', 'index, follow');
    }

    // Open Graph tags
    updateMeta('og:title', title, true);
    updateMeta('og:description', description, true);
    updateMeta('og:type', ogType, true);
    updateMeta('og:image', ogImage.startsWith('http') ? ogImage : `${window.location.origin}${ogImage}`, true);
    updateMeta('og:site_name', 'CampusVoice.AI', true);
    
    if (canonicalUrl) {
      updateMeta('og:url', canonicalUrl, true);
      
      // Update canonical link
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = canonicalUrl;
    }

    // Twitter Card tags
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', ogImage.startsWith('http') ? ogImage : `${window.location.origin}${ogImage}`);

    // Cleanup function to reset title on unmount (optional)
    return () => {
      // We don't reset on unmount as the next page will set its own
    };
  }, [title, description, ogImage, ogType, canonicalUrl, keywords, noIndex]);

  return null; // This component doesn't render anything
}

export default SEOHead;
