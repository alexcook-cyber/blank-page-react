import React, { useState } from 'react';
import { SeoData, TopKeyword } from '../types';
import { formatNumber, formatCurrency } from '../services/seoService';
import { Info, TrendingUp, BarChart2, Download, Loader2, Share2, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ResultsProps {
  data: SeoData[];
}

// Internal component for the DR/UR linear progress metric
const RatingMetric = ({ 
  value, 
  label, 
  subLabel, 
  color = '#0a24e0' 
}: { 
  value: number, 
  label: string, 
  subLabel?: string, 
  color?: string 
}) => {
  return (
    <div className="flex flex-col items-start text-left">
        {/* Value */}
        <div className="text-4xl font-bold text-gray-900 tracking-tighter mb-1">{value}</div>
        
        {/* Label with Info Icon */}
        <div className="flex items-center gap-1.5 mb-3">
            <div className="text-sm font-bold text-gray-600 uppercase tracking-wide">{label}</div>
            <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
        </div>

        {/* Progress Line */}
        <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
            <div 
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{ 
                    width: `${Math.min(Math.max(value, 0), 100)}%`, 
                    backgroundColor: color 
                }}
            />
        </div>

        {/* Sub Label */}
        {subLabel && <div className="text-xs text-gray-400 font-medium">{subLabel}</div>}
    </div>
  );
};

// New component for Organic Stats to match the Big Number style without progress bar
// Updated to have Value above Label
const BigStat = ({ 
  value, 
  label, 
  subLabel, 
  subLabelColor = "text-gray-400" 
}: { 
  value: number | string, 
  label: string, 
  subLabel?: React.ReactNode, 
  subLabelColor?: string 
}) => {
  return (
    <div className="flex flex-col items-start text-left">
        {/* Value */}
        <div className="text-4xl font-bold text-gray-900 tracking-tighter mb-1">
            {typeof value === 'number' ? formatNumber(value) : value}
        </div>

        {/* Label with Info Icon */}
        <div className="flex items-center gap-1.5 mb-2">
            <div className="text-sm font-bold text-gray-600 uppercase tracking-wide">{label}</div>
            <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
        </div>
        
        {/* Sub Label */}
        {subLabel && <div className={`text-xs font-medium ${subLabelColor}`}>{subLabel}</div>}
    </div>
  );
};

type SortField = keyof TopKeyword;
type SortDirection = 'asc' | 'desc';

export const Results: React.FC<ResultsProps> = ({ data }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [sortField, setSortField] = useState<SortField>('position');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  if (!data || data.length === 0) return null;

  const result = data[0];
  const overview = result.keyword_overview;

  // Sort Logic
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field. Default to 'asc' for Position (lower is better), 'desc' for others (higher is better)
      setSortField(field);
      if (field === 'position') {
          setSortDirection('asc');
      } else {
          setSortDirection('desc');
      }
    }
  };

  const getSortedKeywords = () => {
    if (!result.top_keywords) return [];

    return [...result.top_keywords].sort((a, b) => {
      const aValue = a[sortField] ?? (sortField === 'position' ? 999 : 0);
      const bValue = b[sortField] ?? (sortField === 'position' ? 999 : 0);

      // Handle Strings (if we were sorting by keyword, though not currently requested)
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
      }

      // Handle Numbers
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const sortedKeywords = getSortedKeywords();

  const SortIcon = ({ field }: { field: SortField }) => {
      if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-50 transition-opacity" />;
      return sortDirection === 'asc' 
        ? <ArrowUp className="w-3 h-3 text-[#0a24e0]" /> 
        : <ArrowDown className="w-3 h-3 text-[#0a24e0]" />;
  };

  const handleExportPDF = async () => {
    const element = document.getElementById('seo-report-container');
    const card = document.getElementById('keyword-analysis-card');
    const tableContainer = document.getElementById('keyword-table-container');

    if (!element) return;

    setIsExporting(true);

    // Temporarily expand scrollable areas to capture full content
    if (card) {
        card.style.maxHeight = 'none';
        card.style.overflow = 'visible';
    }
    if (tableContainer) {
        tableContainer.style.overflow = 'visible';
        tableContainer.style.height = 'auto';
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#f7f5f2',
        ignoreElements: (element) => {
          return element.classList.contains('export-exclude');
        },
        windowHeight: element.scrollHeight + 100
      });

      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${result.domain}-analysis-report.pdf`);

    } catch (error) {
      console.error('Export failed:', error);
      alert('An error occurred while generating the PDF.');
    } finally {
      if (card) {
          card.style.maxHeight = '';
          card.style.overflow = '';
      }
      if (tableContainer) {
          tableContainer.style.overflow = '';
          tableContainer.style.height = '';
      }
      setIsExporting(false);
    }
  };

  return (
    <div id="seo-report-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
            <h2 className="text-2xl font-bold text-gray-900">Overview: <span className="text-[#0a24e0]">{result.domain}</span></h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-medium text-gray-500">Analysis from {result.date}</span>
            </div>
        </div>
        <div className="flex gap-3 export-exclude">
            <button 
              onClick={handleExportPDF}
              disabled={isExporting}
              className="text-sm font-medium text-gray-600 hover:text-[#0a24e0] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Export PDF
            </button>
            <span className="text-gray-300">|</span>
            <button className="text-sm font-medium text-gray-600 hover:text-[#0a24e0] transition-colors flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Share Analysis
            </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        
        {/* Left Column: Backlink Profile (Widened to 7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h3 className="font-bold text-gray-900">Backlink profile</h3>
                <span className="text-xs font-semibold text-[#0a24e0] bg-blue-50 px-2 py-1 rounded">High Authority</span>
            </div>
            
            <div className="p-6">
                
                {/* DR and UR Row - Left Aligned */}
                <div className="flex items-center justify-start gap-12 sm:gap-24 mb-10 mt-2">
                     <RatingMetric value={result.dr} label="DR" subLabel="Domain Rating" color="#0a24e0" />
                     <RatingMetric value={result.ur || 0} label="UR" subLabel="URL Rating" color="#f59e0b" />
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-100 mb-6 w-full"></div>

                {/* Bottom Row: AR, Backlinks & Ref Domains */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                     <div>
                        <div className="flex items-center gap-1 mb-1">
                            <div className="text-sm font-bold text-gray-700 uppercase tracking-wide">AR</div>
                            <Info className="w-3 h-3 text-gray-400" />
                        </div>
                        <div className="text-xl font-bold text-gray-900">#{formatNumber(result.ar)}</div>
                        <div className="text-xs text-gray-500 mt-1">AddPeople Rank</div>
                     </div>

                    <div>
                        <div className="flex items-center gap-1 mb-1">
                            <div className="text-sm font-medium text-gray-500">Backlinks</div>
                            <Info className="w-3 h-3 text-gray-300" />
                        </div>
                        <div className="text-xl font-bold text-[#0a24e0] tracking-tight">{formatNumber(result.backlinks)}</div>
                        <div className="text-xs text-gray-400 mt-1">All time</div>
                    </div>
                    
                    <div>
                         <div className="flex items-center gap-1 mb-1">
                            <div className="text-sm font-medium text-gray-500">Ref. domains</div>
                            <Info className="w-3 h-3 text-gray-300" />
                        </div>
                        <div className="text-xl font-bold text-[#0a24e0] tracking-tight">{formatNumber(result.ref_domains)}</div>
                         <div className="text-xs text-gray-400 mt-1">All time</div>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: Search (Shortened to 5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
             <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-bold text-gray-900">Search</h3>
            </div>

            <div className="p-6 flex flex-col justify-center h-full">
                
                {/* Organic Section (Reformatted to match Backlink Profile top section alignment) */}
                <div className="flex items-start justify-start gap-8 sm:gap-16 mb-14 mt-2">
                    <BigStat 
                        value={result.organic_keywords} 
                        label="Organic keywords" 
                        subLabel="Top 100 ranking" 
                    />
                    <BigStat 
                        value={result.organic_traffic} 
                        label="Organic traffic" 
                        subLabel={`Value ${formatCurrency(result.organic_value)}`}
                        subLabelColor="text-gray-500"
                    />
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-100 mb-6 w-full"></div>

                {/* Paid Section (Reformatted to match Backlink Profile bottom section) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <div>
                        <div className="flex items-center gap-1 mb-1">
                            <div className="text-sm font-medium text-gray-500">Paid keywords</div>
                            <Info className="w-3 h-3 text-gray-300" />
                        </div>
                        <div className="text-xl font-bold text-[#0a24e0] tracking-tight">{formatNumber(result.paid_keywords)}</div>
                        <div className="text-xs text-gray-400 mt-1">PPC Campaigns</div>
                    </div>
                    <div>
                        <div className="flex items-center gap-1 mb-1">
                            <div className="text-sm font-medium text-gray-500">Paid traffic</div>
                            <Info className="w-3 h-3 text-gray-300" />
                        </div>
                        <div className="text-xl font-bold text-[#0a24e0] tracking-tight">{formatNumber(result.paid_traffic)}</div>
                        <div className="text-xs text-gray-400 mt-1">
                            Cost {formatCurrency(result.paid_cost)}
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </div>
      
      {/* Keyword Overview & Top Keywords Unified Section */}
      <div id="keyword-analysis-card" className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col max-h-[850px]">
            
            {/* 1. Keyword Overview Section (Connected) */}
            <div className="px-6 py-6 border-b border-gray-100 flex-shrink-0 bg-white z-20 relative">
                <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="w-5 h-5 text-[#0a24e0]" />
                    <h3 className="font-bold text-gray-900 text-lg">Keyword Overview</h3>
                </div>
                
                {overview ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8">
                        <div className="flex flex-col">
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Total Keywords</div>
                            <div className="text-2xl font-bold text-gray-900">{formatNumber(overview.total_keywords)}</div>
                        </div>
                        <div className="flex flex-col">
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Est. Traffic</div>
                            <div className="text-2xl font-bold text-gray-900">{formatNumber(overview.total_est_traffic)}</div>
                        </div>
                        <div className="flex flex-col">
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Avg. Position</div>
                            <div className="text-2xl font-bold text-gray-900">{overview.avg_position?.toFixed(1)}</div>
                        </div>
                        <div className="flex flex-col">
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Top 10</div>
                            <div className="text-2xl font-bold text-[#0a24e0]">{formatNumber(overview.top_10_keywords)}</div>
                        </div>
                        <div className="flex flex-col">
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Top 20</div>
                            <div className="text-2xl font-bold text-[#0a24e0]">{formatNumber(overview.top_20_keywords)}</div>
                        </div>
                    </div>
                ) : (
                     <div className="text-sm text-gray-500 italic py-2">No overview data available</div>
                )}
            </div>
            
            {/* 2. Top Keywords Table Header (Sub-header) */}
             <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
                <div className="font-bold text-sm text-gray-700 uppercase tracking-wide">Top Keywords List</div>
                <div className="text-xs text-gray-500 font-medium">
                    Click headers to sort
                </div>
            </div>

            {/* 3. Scrollable Table Container */}
            <div id="keyword-table-container" className="overflow-y-auto overflow-x-auto flex-grow scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                <table className="w-full text-center text-sm relative border-collapse table-fixed">
                    <thead className="bg-gray-50/95 backdrop-blur-sm text-xs uppercase font-semibold text-gray-500 border-b border-gray-100 sticky top-0 z-10 shadow-sm">
                        <tr>
                            {/* Keyword - Not sorted currently */}
                            <th className="px-6 py-4 bg-gray-50 text-center w-[28%]">Keyword</th>

                            {/* Sortable Headers */}
                            <th className="px-6 py-4 text-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors group select-none" onClick={() => handleSort('position')}>
                                <div className="flex items-center justify-center gap-1">
                                    <SortIcon field="position" />
                                    <span>Position</span>
                                </div>
                            </th>
                            
                            <th className="px-6 py-4 text-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors group select-none" onClick={() => handleSort('search_volume')}>
                                <div className="flex items-center justify-center gap-1">
                                    <SortIcon field="search_volume" />
                                    <span>Volume</span>
                                </div>
                            </th>

                            <th className="px-6 py-4 text-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors group select-none" onClick={() => handleSort('difficulty')}>
                                <div className="flex items-center justify-center gap-1">
                                    <SortIcon field="difficulty" />
                                    <span>KD</span>
                                </div>
                            </th>

                            <th className="px-6 py-4 text-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors group select-none" onClick={() => handleSort('est_traffic')}>
                                <div className="flex items-center justify-center gap-1">
                                    <SortIcon field="est_traffic" />
                                    <span>Traffic</span>
                                </div>
                            </th>

                            <th className="px-6 py-4 text-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors group select-none" onClick={() => handleSort('cpc')}>
                                <div className="flex items-center justify-center gap-1">
                                    <SortIcon field="cpc" />
                                    <span>CPC</span>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {sortedKeywords && sortedKeywords.length > 0 ? (
                            sortedKeywords.map((kw, index) => (
                                <tr key={index} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-6 py-4 font-semibold text-gray-900 group-hover:text-[#0a24e0] transition-colors text-center truncate max-w-0">
                                        {kw.keyword}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center justify-center w-8 h-6 rounded text-xs font-bold ${
                                            kw.position <= 3 
                                            ? 'bg-green-100 text-green-700' 
                                            : kw.position <= 10 
                                            ? 'bg-blue-50 text-blue-700' 
                                            : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {kw.position}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center font-medium text-gray-600">
                                        {kw.search_volume?.toLocaleString() || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center justify-center min-w-[32px] h-6 rounded-full text-xs font-bold px-2 ${
                                            kw.difficulty >= 70 ? 'bg-red-100 text-red-700' :
                                            kw.difficulty >= 30 ? 'bg-orange-100 text-orange-700' :
                                            kw.difficulty >= 10 ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-green-100 text-green-700'
                                        }`}>
                                            {kw.difficulty}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center font-medium text-gray-600">
                                        {kw.est_traffic !== null && kw.est_traffic !== undefined ? formatNumber(kw.est_traffic) : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-center text-gray-500 font-mono text-xs">
                                        {kw.cpc !== null ? formatCurrency(kw.cpc) : '-'}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic bg-gray-50/30">
                                    <div className="flex flex-col items-center gap-2">
                                        <BarChart2 className="w-8 h-8 text-gray-300" />
                                        <span>No top keyword data available for this domain.</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Footer */}
            {result.top_keywords && result.top_keywords.length > 0 && (
                 <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 text-right flex-shrink-0">
                    <button className="text-xs font-bold text-[#0a24e0] hover:underline uppercase tracking-wide">View Full Report</button>
                </div>
            )}
      </div>

    </div>
  );
};