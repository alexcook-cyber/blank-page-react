
import { SeoData, KeywordAnalysis, CompetitorAnalysisResult } from '../types';

const DOMAIN_WEBHOOK_URL = 'https://lgnengineers.app.n8n.cloud/webhook/seo-report';
const KEYWORD_WEBHOOK_URL = 'https://lgnengineers.app.n8n.cloud/webhook/keyword-explorer';
const COMPETITOR_WEBHOOK_URL = 'https://lgnengineers.app.n8n.cloud/webhook/competitor-analysis';

export const analyzeDomain = async (domain: string): Promise<SeoData[]> => {
  try {
    console.log(`Sending analysis request for: ${domain} to ${DOMAIN_WEBHOOK_URL}`);
    
    const response = await fetch(DOMAIN_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify([{ domain }]),
    });

    if (!response.ok) {
      const errorText = response.statusText || 'Unknown Error';
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Received data:', data);
    
    // Helper function to map API response to SeoData interface
    const mapItemToSeoData = (item: any): SeoData => {
        // Check if the item follows the nested structure (overview + keyword_analysis)
        if (item.overview || item.keyword_analysis) {
            return {
                domain: item.domain || domain, // Fallback to requested domain if missing
                date: item.date || new Date().toLocaleDateString(),
                // Extract metrics from overview object, default to 0 if missing
                dr: item.overview?.dr ?? 0,
                ur: item.overview?.ur ?? 0,
                ar: item.overview?.ar ?? 0,
                backlinks: item.overview?.backlinks ?? 0,
                ref_domains: item.overview?.ref_domains ?? 0,
                organic_keywords: item.overview?.organic_keywords ?? 0,
                organic_traffic: item.overview?.organic_traffic ?? 0,
                organic_value: item.overview?.organic_value ?? 0,
                paid_keywords: item.overview?.paid_keywords ?? 0,
                paid_traffic: item.overview?.paid_traffic ?? 0,
                paid_cost: item.overview?.paid_cost ?? 0,
                // Extract keyword overview and list
                keyword_overview: item.keyword_analysis?.summary,
                top_keywords: item.keyword_analysis?.keywords || []
            };
        }
        
        // Fallback for flat structure if API format changes back or is mixed
        return item as SeoData;
    };
    
    // Ensure we return an array mapped to the correct structure
    if (Array.isArray(data)) {
        return data.map(mapItemToSeoData);
    } else if (typeof data === 'object' && data !== null) {
        // Handle case where single object is returned instead of array
        return [mapItemToSeoData(data)];
    }
    
    return [];
  } catch (error) {
    console.error("Failed to fetch SEO data:", error);
    // Re-throw to be handled by the UI
    throw error;
  }
};

export const analyzeKeyword = async (keyword: string): Promise<KeywordAnalysis[]> => {
  try {
    console.log(`Sending keyword request for: ${keyword} to ${KEYWORD_WEBHOOK_URL}`);

    const response = await fetch(KEYWORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ keyword }),
    });

    if (!response.ok) {
      const errorText = response.statusText || 'Unknown Error';
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Received keyword data:', data);

    if (Array.isArray(data)) {
      return data as KeywordAnalysis[];
    } else if (typeof data === 'object' && data !== null) {
      return [data as KeywordAnalysis];
    }

    return [];
  } catch (error) {
    console.error("Failed to fetch Keyword data:", error);
    throw error;
  }
};

export const analyzeCompetitors = async (baseDomain: string, competitors: string[]): Promise<CompetitorAnalysisResult | null> => {
  try {
    console.log(`Sending competitor request for: ${baseDomain} vs ${competitors.join(', ')} to ${COMPETITOR_WEBHOOK_URL}`);

    const response = await fetch(COMPETITOR_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        base_domain: baseDomain,
        competitors: competitors
      }),
    });

    if (!response.ok) {
      const errorText = response.statusText || 'Unknown Error';
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    // Use text() first to safely handle potentially empty responses or debug parsing errors
    const text = await response.text();
    if (!text) {
        throw new Error('Received empty response from server');
    }

    const data = JSON.parse(text);
    console.log('Received competitor data:', data);

    // Check if the response follows the array structure [ { base_domain, ... } ]
    if (Array.isArray(data) && data.length > 0) {
        // The API returns an array, we take the first item as it contains the full report
        return data[0] as CompetitorAnalysisResult;
    }
    
    // If it's a direct object
    if (typeof data === 'object' && data !== null && (data.base_domain || data.keyword_gap_analysis)) {
       return data as CompetitorAnalysisResult;
    }

    return null;
  } catch (error) {
    console.error("Failed to fetch Competitor data:", error);
    throw error;
  }
};

export const formatNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined) {
    return '0';
  }

  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
};

export const formatCurrency = (num: number | null | undefined): string => {
  if (num === null || num === undefined) {
    return '-';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(num);
};
