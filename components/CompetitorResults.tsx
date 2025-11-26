
import React, { useMemo, useState } from 'react';
import { CompetitorAnalysisResult, CompetitorKeyword } from '../types';
import { formatNumber, formatCurrency } from '../services/seoService';
import { ArrowUp, ArrowDown, ArrowUpDown, Target, BarChart2, TrendingUp, Info, Zap, Award } from 'lucide-react';

interface CompetitorResultsProps {
  data: CompetitorAnalysisResult;
}

type SortField = keyof CompetitorKeyword;
type SortDirection = 'asc' | 'desc';

export const CompetitorResults: React.FC<CompetitorResultsProps> = ({ data }) => {
  const [sortField, setSortField] = useState<SortField>('opportunity_score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  if (!data) return null;

  const { base_domain, base_metrics, competitors, keyword_gap_analysis } = data;
  const keywords = keyword_gap_analysis.keywords || [];
  const summary = keyword_gap_analysis.summary;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      // Default directions
      if (field === 'competitor_position' || field === 'competition') {
          setSortDirection('asc'); // Lower is usually better (rank) or easier (KD)
      } else {
          setSortDirection('desc'); // Higher is better (Vol, Score, Traffic)
      }
    }
  };

  const sortedKeywords = useMemo(() => {
    return [...keywords].sort((a, b) => {
      const aValue = a[sortField] ?? 0;
      const bValue = b[sortField] ?? 0;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [keywords, sortField, sortDirection]);

  const SortIcon = ({ field }: { field: SortField }) => {
      if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-50 transition-opacity" />;
      return sortDirection === 'asc' 
        ? <ArrowUp className="w-3 h-3 text-[#0a24e0]" /> 
        : <ArrowDown className="w-3 h-3 text-[#0a24e0]" />;
  };

  // Helper to calculate percentage difference
  const getPercentDiff = (base: number | string, comp: number | string) => {
    const baseNum = typeof base === 'string' ? parseFloat(base) : base;
    const compNum = typeof comp === 'string' ? parseFloat(comp) : comp;

    if (isNaN(baseNum) || isNaN(compNum) || baseNum === 0) return null;

    const diff = ((compNum - baseNum) / baseNum) * 100;
    return diff;
  };

  // Helper for Comparison Table Rows
  const renderComparisonRow = (
      label: string, 
      baseValue: number | string, 
      compValues: (number | string)[], 
      isCurrency: boolean = false,
      formatFn: (v: any) => string = formatNumber
  ) => (
      <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors group/row">
          <td className="px-6 py-4 text-sm font-medium text-gray-500">{label}</td>
          <td className="px-6 py-4 text-center font-bold text-gray-900 bg-blue-50/30 border-r border-blue-100/50">
              {isCurrency ? formatCurrency(baseValue as number) : formatFn(baseValue)}
          </td>
          {compValues.map((val, idx) => {
              const diff = getPercentDiff(baseValue, val);
              return (
                <td key={idx} className="px-6 py-4 text-center font-medium text-gray-700">
                    <div className="flex flex-col items-center justify-center gap-0.5">
                        <span className="text-gray-900 font-semibold">
                            {isCurrency ? formatCurrency(val as number) : formatFn(val)}
                        </span>
                        {diff !== null && Math.abs(diff) >= 1 && (
                            <div className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                diff > 0 
                                ? 'bg-green-50 text-green-700' 
                                : 'bg-red-50 text-red-700'
                            }`}>
                                {diff > 0 ? <ArrowUp className="w-2.5 h-2.5 mr-0.5" /> : <ArrowDown className="w-2.5 h-2.5 mr-0.5" />}
                                {Math.abs(diff).toFixed(0)}%
                            </div>
                        )}
                    </div>
                </td>
              );
          })}
      </tr>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div>
            <div className="flex items-center gap-3 mb-2">
                <span className="bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    Competitor Analysis
                </span>
                <span className="text-sm text-gray-500 font-medium">{data.date}</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
                <span className="text-[#0a24e0]">{base_domain}</span> <span className="text-gray-400 font-light mx-2">vs</span> Competitors
            </h2>
        </div>

        {/* 1. Comparison Matrix */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                 <h3 className="font-bold text-gray-900">Domain Comparison</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-white border-b border-gray-200">
                            <th className="px-6 py-4 w-48"></th>
                            <th className="px-6 py-4 text-center min-w-[180px] bg-blue-50/50 border-b-2 border-[#0a24e0] border-r border-blue-100/50">
                                <div className="text-sm font-bold text-[#0a24e0] uppercase tracking-wide mb-1">You</div>
                                <div className="text-lg font-bold text-gray-900 truncate">{base_domain}</div>
                            </th>
                            {competitors.map((comp, idx) => (
                                <th key={idx} className="px-6 py-4 text-center min-w-[180px]">
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Competitor {idx + 1}</div>
                                    <div className="text-base font-bold text-gray-700 truncate max-w-[200px] mx-auto" title={comp.domain}>
                                        {comp.domain}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {renderComparisonRow('Domain Rating', base_metrics.dr, competitors.map(c => c.metrics.dr), false, (v) => v.toString())}
                        {renderComparisonRow('Backlinks', base_metrics.backlinks, competitors.map(c => c.metrics.backlinks))}
                        {renderComparisonRow('Ref. Domains', base_metrics.ref_domains, competitors.map(c => c.metrics.ref_domains))}
                        {renderComparisonRow('Organic Keywords', base_metrics.organic_keywords, competitors.map(c => c.metrics.organic_keywords))}
                        {renderComparisonRow('Organic Traffic', base_metrics.organic_traffic, competitors.map(c => c.metrics.organic_traffic))}
                        {renderComparisonRow('Traffic Value', base_metrics.organic_value, competitors.map(c => c.metrics.organic_value), true)}
                    </tbody>
                </table>
            </div>
        </div>

        {/* 2. Gap Analysis Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {/* Card 1: Total Gaps */}
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col h-32 relative overflow-hidden group">
                <div className="absolute right-[-10px] top-[-10px] opacity-5 transform rotate-12 group-hover:scale-110 transition-transform">
                    <Target className="w-24 h-24" />
                </div>
                <div className="flex justify-between items-start mb-auto">
                    <span className="text-sm font-bold text-gray-600 uppercase">Missing Keywords</span>
                </div>
                <div>
                     <div className="text-3xl font-bold text-[#0a24e0]">{summary.total_keyword_gaps}</div>
                     <div className="text-xs text-gray-400 mt-1">Total opportunities found</div>
                </div>
             </div>

             {/* Card 2: Potential Volume */}
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col h-32">
                <div className="flex justify-between items-start mb-auto">
                    <span className="text-sm font-bold text-gray-600 uppercase">Total Volume</span>
                </div>
                <div>
                     <div className="text-3xl font-bold text-gray-900">{formatNumber(summary.total_search_volume)}</div>
                     <div className="text-xs text-gray-400 mt-1">Monthly search volume</div>
                </div>
             </div>

             {/* Card 3: Quick Wins */}
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col h-32">
                 <div className="flex justify-between items-start mb-auto">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-600 uppercase">Low Difficulty</span>
                        <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">KD &lt; 40</span>
                    </div>
                </div>
                <div>
                     <div className="text-3xl font-bold text-green-600">{summary.quick_wins}</div>
                     <div className="text-xs text-gray-400 mt-1">Low difficulty keywords</div>
                </div>
             </div>

             {/* Card 4: High Value */}
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col h-32">
                 <div className="flex justify-between items-start mb-auto">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-600 uppercase">High Value</span>
                        <Award className="w-4 h-4 text-purple-500" />
                    </div>
                </div>
                <div>
                     <div className="text-3xl font-bold text-purple-600">{summary.high_value_targets}</div>
                     <div className="text-xs text-gray-400 mt-1">High volume, high intent Keywords</div>
                </div>
             </div>
        </div>

        {/* 3. Detailed Keyword Gap Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 bg-white flex justify-between items-center sticky top-0 z-20">
                 <div>
                    <h3 className="font-bold text-gray-900 text-lg">Keyword Opportunities</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Keywords where competitors rank but you don't</p>
                 </div>
            </div>

            <div className="overflow-x-auto min-h-[500px]">
                <table className="w-full text-left text-sm relative border-collapse">
                    <thead className="bg-gray-50/95 backdrop-blur-sm text-xs uppercase font-semibold text-gray-500 border-b border-gray-100 sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="px-6 py-4 w-[25%] cursor-pointer hover:bg-gray-100 transition-colors group" onClick={() => handleSort('keyword')}>
                                <div className="flex items-center gap-1">
                                    <span>Keyword</span>
                                    <SortIcon field="keyword" />
                                </div>
                            </th>
                            <th className="px-6 py-4 w-[20%] cursor-pointer hover:bg-gray-100 transition-colors group" onClick={() => handleSort('competitor_domain')}>
                                <div className="flex items-center gap-1">
                                    <span>Competitor</span>
                                    <SortIcon field="competitor_domain" />
                                </div>
                            </th>
                            <th className="px-6 py-4 text-center cursor-pointer hover:bg-gray-100 transition-colors group" onClick={() => handleSort('competitor_position')}>
                                <div className="flex items-center justify-center gap-1">
                                    <span>Rank</span>
                                    <SortIcon field="competitor_position" />
                                </div>
                            </th>
                            <th className="px-6 py-4 text-center cursor-pointer hover:bg-gray-100 transition-colors group" onClick={() => handleSort('search_volume')}>
                                <div className="flex items-center justify-center gap-1">
                                    <span>Vol</span>
                                    <SortIcon field="search_volume" />
                                </div>
                            </th>
                            <th className="px-6 py-4 text-center cursor-pointer hover:bg-gray-100 transition-colors group" onClick={() => handleSort('competition')}>
                                <div className="flex items-center justify-center gap-1">
                                    <span>KD</span>
                                    <SortIcon field="competition" />
                                </div>
                            </th>
                             <th className="px-6 py-4 text-center cursor-pointer hover:bg-gray-100 transition-colors group" onClick={() => handleSort('cpc')}>
                                <div className="flex items-center justify-center gap-1">
                                    <span>CPC</span>
                                    <SortIcon field="cpc" />
                                </div>
                            </th>
                             <th className="px-6 py-4 text-center cursor-pointer hover:bg-gray-100 transition-colors group" onClick={() => handleSort('opportunity_score')}>
                                <div className="flex items-center justify-center gap-1">
                                    <span>Opp. Score</span>
                                    <Info className="w-3 h-3 text-gray-300" />
                                    <SortIcon field="opportunity_score" />
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {sortedKeywords.map((item, index) => (
                            <tr key={index} className="hover:bg-blue-50/30 transition-colors group">
                                <td className="px-6 py-4 font-semibold text-gray-900 group-hover:text-[#0a24e0] transition-colors">
                                    {item.keyword}
                                </td>
                                <td className="px-6 py-4 text-gray-600 truncate max-w-[200px]" title={item.competitor_domain}>
                                    {item.competitor_domain}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded text-xs font-bold border border-gray-200">
                                        #{item.competitor_position}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center font-medium text-gray-600">
                                    {formatNumber(item.search_volume)}
                                </td>
                                <td className="px-6 py-4 text-center">
                                     <span className={`inline-flex items-center justify-center w-8 h-6 rounded text-xs font-bold ${
                                            item.competition >= 70 ? 'bg-red-100 text-red-700' :
                                            item.competition >= 40 ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-green-100 text-green-700'
                                        }`}>
                                            {item.competition}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center text-xs text-gray-500 font-mono">
                                    {formatCurrency(item.cpc)}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${
                                                    item.opportunity_score > 500 ? 'bg-green-500' :
                                                    item.opportunity_score > 100 ? 'bg-blue-500' :
                                                    'bg-gray-400'
                                                }`}
                                                style={{ width: `${Math.min((item.opportunity_score / 1000) * 100, 100)}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-500">
                                            {formatNumber(item.opportunity_score)}
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 text-right">
                <span className="text-xs text-gray-400">Showing top {keywords.length} opportunities</span>
            </div>
        </div>
    </div>
  );
};
