import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface FAQItem {
  question: string;
  answer: string;
}

interface SEOHeadProps {
  title?: string;
  description?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  canonicalUrl?: string;
  keywords?: string[];
  noIndex?: boolean;
  // JSON-LD structured data
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  // Convenience props for common schemas
  faqItems?: FAQItem[];
}

// Base organization schema for CampusVoice
const getOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'CampusVoice.AI',
  url: 'https://engage-ethos.lovable.app',
  logo: 'https://engage-ethos.lovable.app/campusvoice-logo.png',
  description: 'Strategic Messaging Intelligence for Higher Education',
  sameAs: [
    'https://twitter.com/CampusVoiceAI'
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'hello@campusvoice.ai',
    contactType: 'customer service'
  }
});

// Software application schema for product pages
export const getSoftwareApplicationSchema = (
  name: string,
  description: string,
  featureList?: string[]
) => ({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name,
  description,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Beta Access'
  },
  ...(featureList && { featureList })
});

// FAQ schema generator
export const getFAQSchema = (items: FAQItem[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map(item => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer
    }
  }))
});

// WebPage schema for feature pages
export const getWebPageSchema = (
  name: string,
  description: string,
  url: string
) => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name,
  description,
  url,
  isPartOf: {
    '@type': 'WebSite',
    name: 'CampusVoice.AI',
    url: 'https://engage-ethos.lovable.app'
  },
  provider: getOrganizationSchema()
});

/**
 * SEOHead - Manages document head meta tags and JSON-LD structured data for SEO
 * 
 * Usage:
 * <SEOHead 
 *   title="Page Title" 
 *   description="Page description under 160 chars"
 *   jsonLd={getSoftwareApplicationSchema('Product Name', 'Description')}
 *   faqItems={[{ question: 'Q?', answer: 'A.' }]}
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
  jsonLd,
  faqItems,
}: SEOHeadProps) {
  const location = useLocation();
  
  // Auto-generate canonical URL from current route if not provided
  const effectiveCanonicalUrl = canonicalUrl || `${window.location.origin}${location.pathname}`;

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
    updateMeta('og:url', effectiveCanonicalUrl, true);
    
    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = effectiveCanonicalUrl;

    // Twitter Card tags
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', ogImage.startsWith('http') ? ogImage : `${window.location.origin}${ogImage}`);

    // JSON-LD Structured Data
    const existingScripts = document.querySelectorAll('script[data-seo-jsonld]');
    existingScripts.forEach(script => script.remove());

    const schemas: Record<string, unknown>[] = [];
    
    // Add custom JSON-LD if provided
    if (jsonLd) {
      if (Array.isArray(jsonLd)) {
        schemas.push(...jsonLd);
      } else {
        schemas.push(jsonLd);
      }
    }

    // Add FAQ schema if items provided
    if (faqItems && faqItems.length > 0) {
      schemas.push(getFAQSchema(faqItems));
    }

    // Inject each schema as a separate script tag
    schemas.forEach((schema, index) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-jsonld', `schema-${index}`);
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    // Cleanup function
    return () => {
      const scripts = document.querySelectorAll('script[data-seo-jsonld]');
      scripts.forEach(script => script.remove());
    };
  }, [title, description, ogImage, ogType, effectiveCanonicalUrl, keywords, noIndex, jsonLd, faqItems]);

  return null; // This component doesn't render anything
}

export { getOrganizationSchema };
export default SEOHead;
