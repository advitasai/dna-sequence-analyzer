import React, { useState, useMemo } from 'react';
import { FastaRecord, MotifMatch } from '../types/bioinformatics';
import { BIOTECH_MOTIF_PRESETS, findMotif } from '../utils/dnaAnalyzer';
import { Search, Sparkles, MapPin, ArrowRight, Check, Copy } from 'lucide-react';

interface MotifFinderSectionProps {
  record: FastaRecord;
  onSelectMatch: (pos: number) => void;
  selectedPos: number | null;
  onMotifChange?: (matches: MotifMatch[]) => void;
}

export const MotifFinderSection: React.FC<MotifFinderSectionProps> = ({
  record,
  onSelectMatch,
  selectedPos,
  onMotifChange,
}) => {
  const [queryMotif, setQueryMotif] = useState('ATG');
  const [includeReverse, setIncludeReverse] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const seq = record.sequence;

  // Run motif search
  const matches = useMemo(() => {
    const res = findMotif(seq, queryMotif, includeReverse);
    if (onMotifChange) {
      onMotifChange(res);
    }
    return res;
  }, [seq, queryMotif, includeReverse, onMotifChange]);

  const handlePresetClick = (presetMotif: string) => {
    setQueryMotif(presetMotif);
  };

  const handleCopyPositions = () => {
    const text = matches.map((m) => m.position).join(', ');
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar & Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Sequence Motif & Restriction Site Search
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Locate 1-based start positions of regulatory motifs, restriction enzyme cut sites, or primers
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={includeReverse}
                onChange={(e) => setIncludeReverse(e.target.checked)}
                className="rounded-sm border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <span>Include reverse complement strand (3'←5')</span>
            </label>
          </div>
        </div>

        {/* Motif Input Row */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={queryMotif}
              onChange={(e) => setQueryMotif(e.target.value.toUpperCase())}
              placeholder="Enter pattern (e.g. ATG, GAATTC, TATAAA, NGG)..."
              className="w-full pl-9 pr-4 py-2.5 font-mono text-sm uppercase bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-transparent tracking-widest font-bold"
            />
          </div>

          {matches.length > 0 && (
            <button
              onClick={handleCopyPositions}
              className="px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
              title="Copy all match position coordinates"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Positions ({matches.length})</span>
            </button>
          )}
        </div>

        {/* Preset Motif Chips */}
        <div className="mt-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
            Common Biotechnology Motifs
          </span>
          <div className="flex flex-wrap gap-1.5">
            {BIOTECH_MOTIF_PRESETS.map((preset) => {
              const isActive = queryMotif === preset.motif;
              return (
                <button
                  key={preset.name}
                  onClick={() => handlePresetClick(preset.motif)}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-sky-600 text-white font-semibold shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                  title={`${preset.desc} (${preset.type})`}
                >
                  <span>{preset.name}</span>
                  <span className="font-mono opacity-80 text-[11px]">({preset.motif})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Match Results Summary & List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Search Results
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
              {matches.length} {matches.length === 1 ? 'match' : 'matches'} found
            </span>
          </div>

          {matches.length > 0 && (
            <span className="text-xs text-slate-500 font-mono">
              Positions: [{matches.map((m) => m.position).join(', ')}]
            </span>
          )}
        </div>

        {matches.length === 0 ? (
          <div className="text-center py-8 text-slate-400 dark:text-slate-500 space-y-1">
            <p className="text-sm font-medium">Motif '{queryMotif}' was not found in this sequence.</p>
            <p className="text-xs">Try searching with degenerate IUPAC symbols (e.g. N for any base) or enable reverse strand search.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {matches.map((item, idx) => {
              const isSelected = selectedPos === item.position;
              return (
                <div
                  key={idx}
                  onClick={() => onSelectMatch(item.position)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 ring-1 ring-amber-500/30'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-800/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 rounded-sm bg-slate-200/80 dark:bg-slate-800 font-mono font-bold text-slate-800 dark:text-slate-200">
                      #{idx + 1}
                    </span>

                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-slate-400 dark:text-slate-500">
                        {item.contextBefore}
                      </span>
                      <span className="bg-amber-300 dark:bg-amber-800 text-amber-950 dark:text-amber-100 font-extrabold px-1 rounded-xs">
                        {item.match}
                      </span>
                      <span className="text-slate-400 dark:text-slate-500">
                        {item.contextAfter}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-slate-600 dark:text-slate-400 font-mono">
                      Start Position:{' '}
                      <strong className="text-slate-900 dark:text-white font-bold">
                        {item.position}
                      </strong>
                      <span className="text-[10px] text-slate-400 ml-1">
                        ({item.strand === '+' ? "5'→3' sense" : "3'←5' rev-comp"})
                      </span>
                    </span>

                    <button
                      type="button"
                      className="text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>Highlight</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
