import React from 'react';
import { FastaRecord } from '../types/bioinformatics';
import { gcContent } from '../utils/dnaAnalyzer';
import { Files, CheckCircle2, AlertTriangle, Plus } from 'lucide-react';

interface FastaRecordSelectorProps {
  records: FastaRecord[];
  activeIndex: number;
  onSelectIndex: (index: number) => void;
  onOpenLoadModal: () => void;
}

export const FastaRecordSelector: React.FC<FastaRecordSelectorProps> = ({
  records,
  activeIndex,
  onSelectIndex,
  onOpenLoadModal,
}) => {
  if (records.length <= 1) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs mb-6">
      <div className="flex items-center justify-between gap-3 mb-2 px-1">
        <div className="flex items-center gap-2">
          <Files className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Multi-FASTA Dataset ({records.length} sequences)
          </span>
        </div>
        <button
          onClick={onOpenLoadModal}
          className="text-xs text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Upload / Add More</span>
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {records.map((rec, idx) => {
          const isSelected = activeIndex === idx;
          const gc = gcContent(rec.sequence);

          return (
            <button
              key={rec.id + idx}
              onClick={() => onSelectIndex(idx)}
              className={`p-2 rounded-lg border text-left shrink-0 transition-all cursor-pointer min-w-[170px] max-w-[240px] ${
                isSelected
                  ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 ring-1 ring-sky-500/30'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className="font-mono font-bold text-xs truncate text-slate-900 dark:text-white">
                  &gt;{rec.id}
                </span>
                {rec.valid ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                ) : (
                  <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                )}
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                <span>{rec.sequence.length.toLocaleString()} bp</span>
                <span className="text-sky-600 dark:text-sky-400">GC {gc.toFixed(1)}%</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
