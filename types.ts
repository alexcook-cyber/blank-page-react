
export interface TopKeyword {
  keyword: string;
  position: number;
  search_volume: number;
  cpc: number | null;
  difficulty: number;
  est_traffic: number | null;
}

export interface KeywordOverview {
  total_keywords: number;
  total_est_traffic: number;
  avg_position: number;
  top_10_keywords: number;
  top_20_keywords: number;
}

export interface SeoData {
  domain: string;
  date: string;
  dr: number;
  ur: number;
  ar: number;
  backlinks: number;
  ref_domains: number;
  organic_keywords: number;
  organic_traffic: number;
  organic_value: number;
  paid_keywords: number;
  paid_traffic: number;
  paid_cost: number;
  keyword_overview?: KeywordOverview;
  top_keywords?: TopKeyword[];
}

export interface WebhookResponse {
  [key: string]: any;
}

// --- Keyword Explorer Types ---

export interface MonthlySearch {
  year: number;
  month: number;
  search_volume: number;
}

export interface KeywordMetricOverview {
  search_volume: number;
  competition: number;
  competition_level: string;
  cpc: number;
  monthly_searches: MonthlySearch[];
}

export interface KeywordIdea {
  keyword: string;
  search_volume?: number;
  competition?: number;
  competition_level?: string;
  cpc?: number;
  monthly_searches?: MonthlySearch[];
}

export interface KeywordGroup {
  total_count: number;
  total_search_volume?: number;
  avg_competition?: number;
  keywords: KeywordIdea[];
}

export interface KeywordAnalysis {
  keyword: string;
  date: string;
  overview: KeywordMetricOverview;
  matching_terms?: KeywordGroup;
  related_terms?: KeywordGroup;
  keyword_ideas?: KeywordGroup;
  summary?: {
    total_suggestions: number;
    total_search_volume_all: number;
    high_volume_keywords: number;
    low_competition_keywords: number;
  };
}

// --- Competitor Analysis Types ---

export interface CompetitorKeyword {
  keyword: string;
  competitor_domain: string;
  competitor_position: number;
  search_volume: number;
  competition: number;
  cpc: number | null;
  est_traffic: number;
  opportunity_score: number;
}

export interface CompetitorMetrics {
  dr: number;
  ur: number;
  ar: number;
  backlinks: number;
  ref_domains: number;
  organic_keywords: number;
  organic_traffic: number;
  organic_value: number;
  paid_keywords: number;
  paid_traffic: number;
  paid_cost: number;
}

export interface CompetitorData {
  domain: string;
  metrics: CompetitorMetrics;
}

export interface GapAnalysisSummary {
    total_keyword_gaps: number;
    total_search_volume: number;
    total_est_traffic: number;
    avg_competition: number;
    quick_wins: number;
    high_value_targets: number;
}

export interface CompetitorAnalysisResult {
  date: string;
  base_domain: string;
  base_metrics: CompetitorMetrics;
  competitors: CompetitorData[];
  keyword_gap_analysis: {
      summary: GapAnalysisSummary;
      keywords: CompetitorKeyword[];
  };
}
