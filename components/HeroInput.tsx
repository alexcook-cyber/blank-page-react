import React, { useState } from 'react';
import { ArrowRight, Globe, Loader2, Search, Split, BarChart2, Plus, X } from 'lucide-react';

interface HeroInputProps {
  onAnalyze: (url: string) => void;
  onAnalyzeKeyword: (keyword: string) => void;
  onAnalyzeCompetitors?: (baseDomain: string, competitors: string[]) => void;
  isLoading: boolean;
}

type TabType = 'site' | 'keyword' | 'competitor';

export const HeroInput: React.FC<HeroInputProps> = ({ onAnalyze, onAnalyzeKeyword, onAnalyzeCompetitors, isLoading }) => {
  const [activeTab, setActiveTab] = useState<TabType>('site');
  
  // State for inputs
  const [url, setUrl] = useState('');
  const [keyword, setKeyword] = useState('');
  const [baseDomain, setBaseDomain] = useState('');
  // Initialize with one empty competitor input
  const [competitorDomains, setCompetitorDomains] = useState<string[]>(['']);

  const handleAddCompetitor = () => {
    if (competitorDomains.length < 3) {
      setCompetitorDomains([...competitorDomains, '']);
    }
  };

  const handleRemoveCompetitor = (index: number) => {
    const newDomains = competitorDomains.filter((_, i) => i !== index);
    setCompetitorDomains(newDomains.length ? newDomains : ['']);
  };

  const handleCompetitorChange = (index: number, value: string) => {
    const newDomains = [...competitorDomains];
    newDomains[index] = value;
    setCompetitorDomains(newDomains);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === 'site' && url.trim()) {
      onAnalyze(url);
    } else if (activeTab === 'keyword' && keyword.trim()) {
      onAnalyzeKeyword(keyword);
    } else if (activeTab === 'competitor' && baseDomain.trim() && onAnalyzeCompetitors) {
      // Filter out empty strings
      const validCompetitors = competitorDomains.filter(d => d.trim() !== '');
      if (validCompetitors.length > 0) {
        onAnalyzeCompetitors(baseDomain, validCompetitors);
      }
    }
  };

  const tabs = [
    { id: 'site', label: 'Site Explorer', icon: Globe },
    { id: 'keyword', label: 'Keyword Explorer', icon: Search },
    { id: 'competitor', label: 'Competitor Analysis', icon: Split },
  ];

  return (
    <div className="flex-grow flex flex-col justify-center items-center w-full pb-20">
      <div className="w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8 overflow-x-auto">
            <div className="flex space-x-1 sm:space-x-2 bg-gray-100/80 p-1.5 rounded-xl border border-gray-200/50 backdrop-blur-sm">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap ${
                    isActive
                        ? 'bg-white text-[#0a24e0] shadow-sm ring-1 ring-black/5'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                    }`}
                >
                    <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                    <span>{tab.label}</span>
                </button>
                );
            })}
            </div>
        </div>

        <form onSubmit={handleSubmit} className="relative w-full">
          
          {/* Site Explorer Form */}
          {activeTab === 'site' && (
            <div className="relative flex items-center bg-white shadow-2xl rounded-2xl overflow-hidden transition-shadow hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)]">
              <div className="absolute left-6 flex items-center pointer-events-none text-gray-400">
                 <Globe className="w-6 h-6" />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter domain to analyse (e.g. bbc.co.uk)"
                className="w-full pl-16 pr-32 py-6 bg-transparent border-none text-lg sm:text-xl text-gray-900 placeholder-gray-400 focus:ring-0 outline-none"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="absolute right-2 top-2 bottom-2 bg-[#0a24e0] hover:bg-blue-800 text-white px-6 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed min-w-[60px]"
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <ArrowRight className="w-6 h-6" />
                )}
              </button>
            </div>
          )}

          {/* Keyword Explorer Form */}
          {activeTab === 'keyword' && (
            <div className="relative flex items-center bg-white shadow-2xl rounded-2xl overflow-hidden transition-shadow hover:shadow-[0_20px_50px_rgba(245,_158,_11,_0.1)]">
              <div className="absolute left-6 flex items-center pointer-events-none text-gray-400">
                 <Search className="w-6 h-6" />
              </div>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Enter keyword (e.g. digital marketing)"
                className="w-full pl-16 pr-36 py-6 bg-transparent border-none text-lg sm:text-xl text-gray-900 placeholder-gray-400 focus:ring-0 outline-none"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="absolute right-2 top-2 bottom-2 bg-orange-500 hover:bg-orange-600 text-white px-6 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 min-w-[100px] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>Search</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Competitor Analysis Form */}
          {activeTab === 'competitor' && (
            <div className="bg-white shadow-2xl rounded-2xl overflow-hidden transition-shadow hover:shadow-[0_20px_50px_rgba(10,_36,_224,_0.1)] flex flex-col">
              
              <div className="p-2 space-y-2">
                {/* Base URL */}
                <div className="relative flex items-center bg-gray-50 rounded-xl">
                    <div className="absolute left-4 flex items-center pointer-events-none text-gray-400">
                    <div className="bg-blue-100 p-1 rounded-md">
                        <Globe className="w-4 h-4 text-[#0a24e0]" />
                    </div>
                    </div>
                    <input
                    type="text"
                    value={baseDomain}
                    onChange={(e) => setBaseDomain(e.target.value)}
                    placeholder="Enter your domain"
                    className="w-full pl-14 pr-6 py-4 bg-transparent border-none text-lg text-gray-900 placeholder-gray-400 focus:ring-0 outline-none"
                    />
                </div>

                {/* Competitor URLs */}
                {competitorDomains.map((domain, index) => (
                    <div key={index} className="relative flex items-center bg-white border border-gray-100 rounded-xl group">
                        <div className="absolute left-4 flex items-center pointer-events-none text-gray-400">
                            <div className="bg-orange-100 p-1 rounded-md">
                                <BarChart2 className="w-4 h-4 text-orange-600" />
                            </div>
                        </div>
                        <input
                            type="text"
                            value={domain}
                            onChange={(e) => handleCompetitorChange(index, e.target.value)}
                            placeholder={`Enter competitor domain ${index + 1}`}
                            className="w-full pl-14 pr-12 py-3 bg-transparent border-none text-base text-gray-900 placeholder-gray-400 focus:ring-0 outline-none"
                        />
                         {competitorDomains.length > 1 && (
                            <button
                                type="button"
                                onClick={() => handleRemoveCompetitor(index)}
                                className="absolute right-3 text-gray-300 hover:text-red-500 transition-colors p-1"
                            >
                                <X className="w-4 h-4" />
                            </button>
                         )}
                    </div>
                ))}

                {/* Actions Row */}
                <div className="flex justify-between items-center px-1 pt-2 pb-1">
                     <button
                        type="button"
                        onClick={handleAddCompetitor}
                        disabled={competitorDomains.length >= 3}
                        className={`text-sm font-semibold flex items-center gap-1 transition-colors ${
                            competitorDomains.length >= 3 ? 'text-gray-300 cursor-not-allowed' : 'text-[#0a24e0] hover:text-blue-700'
                        }`}
                    >
                        <Plus className="w-4 h-4" />
                        Add Competitor
                     </button>
                    
                     <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-[#0a24e0] hover:bg-blue-800 text-white px-6 py-2.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 min-w-[120px] disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <Split className="w-5 h-5" />
                                <span>Compare</span>
                            </>
                        )}
                    </button>
                </div>
              </div>
            </div>
          )}

        </form>
      </div>
    </div>
  );
};
