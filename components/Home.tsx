import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface HomeProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
}

export const Home: React.FC<HomeProps> = ({ onAnalyze, isLoading }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onAnalyze(url);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 text-center">
      <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
        Analyze Your Website<br />Performance
      </h1>
      
      <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
        Gain insights into SEO metrics, organic traffic, and paid search data instantly.
      </p>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-left">
            <label htmlFor="url-input" className="block text-sm font-bold text-gray-900 mb-2">
              Website URL
            </label>
            <input
              id="url-input"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.example.com"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0a24e0] focus:border-[#0a24e0] outline-none transition-all text-gray-800 placeholder-gray-400"
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0a24e0] hover:bg-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <span>Analyze URL</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};