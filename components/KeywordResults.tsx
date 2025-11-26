import React, { useMemo, useState } from 'react';
import { KeywordAnalysis, KeywordIdea } from '../types';
import { formatNumber, formatCurrency } from '../services/seoService';
import { Info, BarChart2, TrendingUp, Target, DollarSign, Download, Share2, LayoutGrid, Lightbulb, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { BarChart, Bar, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts';

interface KeywordResultsProps {
  data: KeywordAnalysis[];
}

type TabView = 'overview' | 'ideas';

// Helper for Competition Level Badge - Only Score
const CompetitionBadge = ({ score }: { score?: number }) => {
  if (score === undefined) return <span className="text-gray-400 text-xs">-</span>;

  let colorClass = 'bg-gray-100 text-gray-600';
  if (score >= 70) colorClass = 'bg-red-100 text-red-700';
  else if (score >= 40) colorClass = 'bg-yellow-100 text-yellow-700';
  else colorClass = 'bg-green-100 text-green-700';

  return (
    <span className={`inline-flex items-center justify-center w-10 h-6 rounded-md text-xs font-bold ${colorClass}`}>
      {score}
    </span>
  );
};

// Helper for mini sparkline-style chart in table
const MiniTrendChart = ({ data }: { data?: KeywordIdea['monthly_searches'] }) => {
    if (!data || data.length === 0) return <span className="text-gray-300 text-xs">-</span>;
    
    // Sort by year/month to ensure order
    const sortedData = [...data].sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
    });

    return (
        <div className="h-8 w-24 mx-auto">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sortedData}>
                    <Bar dataKey="search_volume" fill="#cbd5e1" radius={[1, 1, 0, 0]} isAnimationActive={false} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

// Detailed Table for Keyword Ideas
const KeywordTable = ({ keywords, title }: { keywords: KeywordIdea[], title: string }) => {
    const [sortConfig, setSortConfig] = useState<{ key: keyof KeywordIdea | null; direction: 'asc' | 'desc' }>({
        key: null,
        direction: 'desc'
    });

    const sortedKeywords = useMemo(() => {
        if (!sortConfig.key) return keywords;
        
        return [...keywords].sort((a, b) => {
            // Handle Keyword String Sort
            if (sortConfig.key === 'keyword') {
                const aVal = a.keyword.toLowerCase();
                const bVal = b.keyword.toLowerCase();
                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            }

            // Handle Numeric Sort (search_volume, competition, cpc)
            // Default undefined/null to -1 (for asc sort to put them at start) or 0
            // For SEO metrics, 0 or -1 depends on context, usually 0 is fine for display order
            const aVal = (a[sortConfig.key!] as number) ?? 0;
            const bVal = (b[sortConfig.key!] as number) ?? 0;

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [keywords, sortConfig]);

    const handleSort = (key: keyof KeywordIdea) => {
        let direction: 'asc' | 'desc' = 'desc';
        
        // If clicking the same header, toggle direction
        if (sortConfig.key === key) {
             direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
        } else {
            // Default directions for new columns
            // Text usually Ascending first (A-Z), Numbers Descending first (High-Low)
            if (key === 'keyword') direction = 'asc';
            else direction = 'desc'; 
        }
        
        setSortConfig({ key, direction });
    };

    const SortIcon = ({ colKey }: { colKey: keyof KeywordIdea }) => {
        if (sortConfig.key !== colKey) return <ArrowUpDown className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-50 transition-opacity" />;
        return sortConfig.direction === 'asc' 
            ? <ArrowUp className="w-3 h-3 text-[#0a24e0]" /> 
            : <ArrowDown className="w-3 h-3 text-[#0a24e0]" />;
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-full min-h-[600px]">
            <div className="px-6 py-5 border-b border-gray-100 bg-white flex justify-between items-center sticky top-0 z-20">
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                    {title}
                    <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {keywords.length} terms
                    </span>
                </h3>
            </div>

            <div className="overflow-x-auto flex-grow">
                <table className="w-full text-left text-sm border-collapse table-fixed min-w-[800px]">
                    <thead className="bg-gray-50/95 backdrop-blur-sm text-xs uppercase font-semibold text-gray-500 border-b border-gray-100 sticky top-0 z-10">
                        <tr>
                            <th 
                                className="px-6 py-4 w-[40%] cursor-pointer hover:bg-gray-100 transition-colors group select-none"
                                onClick={() => handleSort('keyword')}
                            >
                                <div className="flex items-center gap-1">
                                    <span>Keyword</span>
                                    <SortIcon colKey="keyword" />
                                </div>
                            </th>
                            <th 
                                className="px-6 py-4 text-center w-[15%] cursor-pointer hover:bg-gray-100 transition-colors group select-none"
                                onClick={() => handleSort('search_volume')}
                            >
                                <div className="flex items-center justify-center gap-1">
                                    <span>Volume</span>
                                    <SortIcon colKey="search_volume" />
                                </div>
                            </th>
                            <th className="px-6 py-4 text-center w-[20%]">
                                Trend
                            </th>
                            <th 
                                className="px-6 py-4 text-center w-[10%] cursor-pointer hover:bg-gray-100 transition-colors group select-none"
                                onClick={() => handleSort('competition')}
                            >
                                <div className="flex items-center justify-center gap-1">
                                    <span>KD</span>
                                    <SortIcon colKey="competition" />
                                </div>
                            </th>
                            <th 
                                className="px-6 py-4 text-center w-[15%] cursor-pointer hover:bg-gray-100 transition-colors group select-none"
                                onClick={() => handleSort('cpc')}
                            >
                                <div className="flex items-center justify-center gap-1">
                                    <span>CPC</span>
                                    <SortIcon colKey="cpc" />
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {sortedKeywords.length > 0 ? (
                            sortedKeywords.map((kw, index) => (
                                <tr key={index} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-6 py-3 font-medium text-gray-900 group-hover:text-[#0a24e0] transition-colors truncate">
                                        {kw.keyword}
                                    </td>
                                    <td className="px-6 py-3 text-center font-medium text-gray-600">
                                        {kw.search_volume ? kw.search_volume.toLocaleString() : '-'}
                                    </td>
                                    <td className="px-6 py-3">
                                        <MiniTrendChart data={kw.monthly_searches} />
                                    </td>
                                    <td className="px-6 py-3 text-center">
                                        <CompetitionBadge score={kw.competition} />
                                    </td>
                                    <td className="px-6 py-3 text-center text-gray-600 font-mono text-xs">
                                        {kw.cpc ? formatCurrency(kw.cpc) : '-'}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                                    No keywords found for this section.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const KeywordResults: React.FC<KeywordResultsProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<TabView>('overview');

  if (!data || data.length === 0) return null;

  const result = data[0];
  const { overview, keyword_ideas } = result;

  // Prepare chart data for the main overview
  const volumeHistoryData = useMemo(() => {
    if (!overview.monthly_searches) return [];
    // Sort chronologically
    return [...overview.monthly_searches].sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
    }).map(item => ({
        name: new Date(item.year, item.month - 1).toLocaleString('default', { month: 'short', year: '2-digit' }),
        volume: item.search_volume
    }));
  }, [overview.monthly_searches]);

  const renderContent = () => {
    switch (activeTab) {
        case 'overview':
            return (
                <div className="space-y-6 animate-in fade-in duration-500 min-h-[600px]">
                    {/* Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Volume Card */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between h-40">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    <BarChart2 className="w-5 h-5 text-gray-400" />
                                    <span className="text-sm font-bold text-gray-600 uppercase">Volume</span>
                                </div>
                                <Info className="w-4 h-4 text-gray-300 cursor-help" />
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-gray-900 mb-1">{formatNumber(overview.search_volume)}</div>
                                <div className="text-xs text-gray-500">Avg. monthly searches</div>
                            </div>
                        </div>

                        {/* Difficulty Card */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col h-40">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                                    <Target className="w-5 h-5 text-gray-400" />
                                    <span className="text-sm font-bold text-gray-600 uppercase">Difficulty</span>
                                </div>
                                <Info className="w-4 h-4 text-gray-300 cursor-help" />
                            </div>
                            <div className="flex items-center gap-4 mt-auto">
                                <div className={`relative w-12 h-12 rounded-full border-[3px] flex items-center justify-center flex-shrink-0
                                    ${overview.competition >= 70 ? 'border-red-500 text-red-600' : 
                                    overview.competition >= 40 ? 'border-yellow-500 text-yellow-600' : 
                                    'border-green-500 text-green-600'}`}>
                                    <span className="text-sm font-bold">{overview.competition}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-base font-bold text-gray-900 capitalize leading-tight">
                                        {overview.competition_level.toLowerCase().replace('_', ' ')}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        To rank in top 10
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* CPC Card */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col h-40">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-gray-400" />
                                    <span className="text-sm font-bold text-gray-600 uppercase">CPC</span>
                                </div>
                                <Info className="w-4 h-4 text-gray-300 cursor-help" />
                            </div>
                            <div className="mt-auto">
                                <div className="text-3xl font-bold text-gray-900">{formatCurrency(overview.cpc)}</div>
                                <p className="text-xs text-gray-500 mt-1">Cost Per Click</p>
                            </div>
                        </div>

                        {/* Global/Summary Card */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col h-40">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-gray-400" />
                                    <span className="text-sm font-bold text-gray-600 uppercase">Potential</span>
                                </div>
                                <Info className="w-4 h-4 text-gray-300 cursor-help" />
                            </div>
                            <div className="mt-auto space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-medium text-gray-500">Keyword Ideas</span>
                                    <span className="font-bold text-gray-900">{result.summary?.total_suggestions || keyword_ideas?.total_count || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-medium text-gray-500">Total Vol.</span>
                                    <span className="font-bold text-[#0a24e0]">{formatNumber(result.summary?.total_search_volume_all || keyword_ideas?.total_search_volume)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Volume Trend Chart */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Search Volume History</h3>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={volumeHistoryData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#64748b', fontSize: 12 }} 
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#64748b', fontSize: 12 }} 
                                        tickFormatter={(value) => formatNumber(value)}
                                    />
                                    <Tooltip 
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        itemStyle={{ color: '#0a24e0', fontWeight: 'bold' }}
                                        formatter={(value: number) => [value.toLocaleString(), 'Volume']}
                                    />
                                    <Bar dataKey="volume" fill="#0a24e0" radius={[4, 4, 0, 0]} barSize={40} isAnimationActive={false} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            );
        case 'ideas':
            return (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
                    <KeywordTable keywords={keyword_ideas?.keywords || []} title="Keyword Ideas" />
                </div>
            );
        default:
            return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen flex flex-col">
      
      {/* Header Section - Fixed Layout */}
      <div className="flex-none mb-6">
        {/* Title Row */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 pb-6 border-b border-gray-200">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <span className="bg-orange-50 text-orange-700 border border-orange-200 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                        Keyword Explorer
                    </span>
                    <span className="text-sm text-gray-500 font-medium">{result.date}</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                    {result.keyword}
                </h2>
            </div>
            <div className="flex gap-3 mt-2 md:mt-0">
                <button className="text-sm font-medium text-gray-600 hover:text-[#0a24e0] transition-colors flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm hover:shadow">
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button className="text-sm font-medium text-gray-600 hover:text-[#0a24e0] transition-colors flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm hover:shadow">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
            </div>
        </div>

        {/* Tool Selector / Tabs Row - Separate Container */}
        <div className="mt-6">
            <div className="flex items-center gap-8 border-b border-gray-200">
                <button 
                    onClick={() => setActiveTab('overview')}
                    className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                        activeTab === 'overview' 
                        ? 'border-[#0a24e0] text-[#0a24e0]' 
                        : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                    }`}
                >
                    <LayoutGrid className="w-4 h-4" />
                    Overview
                </button>
                <button 
                    onClick={() => setActiveTab('ideas')}
                    className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                        activeTab === 'ideas' 
                        ? 'border-[#0a24e0] text-[#0a24e0]' 
                        : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                    }`}
                >
                    <Lightbulb className="w-4 h-4" />
                    Keyword Ideas
                    <span className={`text-xs py-0.5 px-2 rounded-full font-medium transition-colors ${
                        activeTab === 'ideas' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                        {keyword_ideas?.keywords?.length || 0}
                    </span>
                </button>
            </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow">
        {renderContent()}
      </div>

    </div>
  );
};