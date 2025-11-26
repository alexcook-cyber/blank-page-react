
import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroInput } from './components/HeroInput';
import { Results } from './components/Results';
import { KeywordResults } from './components/KeywordResults';
import { CompetitorResults } from './components/CompetitorResults';
import { SeoData, KeywordAnalysis, CompetitorAnalysisResult } from './types';
import { analyzeDomain, analyzeKeyword, analyzeCompetitors } from './services/seoService';
import { Link as LinkIcon } from 'lucide-react';

type ViewState = 'home' | 'domain-results' | 'keyword-results' | 'competitor-results';

const App: React.FC = () => {
  const [domainData, setDomainData] = useState<SeoData[]>([]);
  const [keywordData, setKeywordData] = useState<KeywordAnalysis[]>([]);
  const [competitorData, setCompetitorData] = useState<CompetitorAnalysisResult | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewState>('home');

  const handleAnalyzeDomain = async (url: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await analyzeDomain(url);
      setDomainData(result);
      setView('domain-results');
    } catch (err) {
      setError('Failed to fetch domain analysis data. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeKeyword = async (keyword: string) => {
    setLoading(true);
    setError(null);

    try {
        const result = await analyzeKeyword(keyword);
        setKeywordData(result);
        setView('keyword-results');
    } catch (err) {
        setError('Failed to fetch keyword analysis data. Please try again.');
    } finally {
        setLoading(false);
    }
  };

  const handleAnalyzeCompetitors = async (baseDomain: string, competitors: string[]) => {
    setLoading(true);
    setError(null);

    try {
        const result = await analyzeCompetitors(baseDomain, competitors);
        if (result) {
            setCompetitorData(result);
            setView('competitor-results');
        } else {
            setError('No competitor data found.');
        }
    } catch (err) {
        setError('Failed to fetch competitor analysis data. Please try again.');
    } finally {
        setLoading(false);
    }
  };

  const handleLogoClick = () => {
    setView('home');
    setDomainData([]);
    setKeywordData([]);
    setCompetitorData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f5f2] font-sans">
      <Navbar onLogoClick={handleLogoClick} />
      
      <main className="flex-grow flex flex-col">
        {error && (
          <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-8">
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-center gap-3">
              <svg className="h-5 w-5 text-red-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {view === 'home' && (
          <HeroInput 
            onAnalyze={handleAnalyzeDomain} 
            onAnalyzeKeyword={handleAnalyzeKeyword}
            onAnalyzeCompetitors={handleAnalyzeCompetitors}
            isLoading={loading} 
          />
        )}

        {view === 'domain-results' && (
          <Results data={domainData} />
        )}

        {view === 'keyword-results' && (
            <KeywordResults data={keywordData} />
        )}

        {view === 'competitor-results' && competitorData && (
            <CompetitorResults data={competitorData} />
        )}
      </main>

      <footer className="bg-[#f7f5f2] border-t border-gray-200 py-16 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-[#4b5563] rounded flex items-center justify-center">
                  <LinkIcon className="w-3 h-3 text-white transform -rotate-45" />
                </div>
                <span className="text-lg font-bold text-gray-700">SEO Analyser</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                A powerful tool for deep URL and keyword insights.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-900 mb-4 text-sm">Features</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li>Site Explorer</li>
                <li>Keyword Explorer</li>
                <li>Competitor Analysis</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-4 text-sm">Support</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-4 text-sm">Connect</h4>
              <div className="flex items-center gap-4 text-gray-500">
                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-16 pt-8 text-center text-xs text-gray-500">
            <p>&copy; 2025 SEO Analyzer. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
