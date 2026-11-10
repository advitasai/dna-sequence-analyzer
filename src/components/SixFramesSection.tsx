import React, { useState, useMemo } from 'react';
import { FastaRecord, ReadingFrame } from '../types/bioinformatics';
import { calculateSixFrames } from '../utils/dnaAnalyzer';
import { Copy, Check, Info, Sparkles } from 'lucide-react';

interface SixFramesSectionProps {
  record: FastaRecord;
}

export const SixFramesSection: React.FC<SixFramesSectionProps> = ({ record }) => {
  const [selectedFrame, setSelectedFrame] = useState<number>(1);
  const [copiedFrame, setCopiedFrame] = useState<number | null>(null);

  const frames: ReadingFrame[] = useMemo(
    () => calculateSixFrames(record.sequence),
    [record.sequence]
  );

  const activeFrameData = frames.find((f) => f.frame === selectedFrame) || frames[0];

  const handleCopyProtein = (prot: string, fNum: number) => {
    navigator.clipboard.writeText(prot);
    setCopiedFrame(fNum);
    setTimeout(() => setCopiedFrame(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              6-Frame Translation & Open Reading Frames (ORFs)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Analyzes all three forward (+1, +2, +3) and three reverse (-1, -2, -3) reading frames for potential protein-coding sequences
            </p>
          </div>
        </div>

        {/* Frame Selector Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-4">
          {frames.map((f) => {
            const isSelected = selectedFrame === f.frame;
            const orfCount = f.orfs.length;
            const longestOrf = f.orfs[0];

            return (
              <button
                key={f.frame}
                onClick={() => setSelectedFrame(f.frame)}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 ring-1 ring-sky-500/40 text-sky-950 dark:text-sky-200'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs">
                    {f.frame > 0 ? `+${f.frame}` : f.frame}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {f.direction === '+' ? "5'→3'" : "3'←5'"}
                  </span>
                </div>
                <div className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                  {orfCount} {orfCount === 1 ? 'ORF' : 'ORFs'}
                  {longestOrf && (
                    <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-medium truncate">
                      Max: {longestOrf.lengthCodons} aa
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Frame Detailed Inspection */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white font-mono">
              {activeFrameData.label} Translation
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Total translated residues: {activeFrameData.protein.length} aa
            </span>
          </div>

          <button
            onClick={() => handleCopyProtein(activeFrameData.protein, activeFrameData.frame)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            {copiedFrame === activeFrameData.frame ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Protein</span>
              </>
            )}
          </button>
        </div>

        {/* Protein Translation Output with * Stop Highlight */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
            Amino Acid String (Asterisks '*' represent termination STOP codons)
          </label>
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-xs leading-relaxed break-all select-all max-h-44 overflow-y-auto">
            {activeFrameData.protein.split('').map((char, i) => {
              if (char === '*') {
                return (
                  <span
                    key={i}
                    className="bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100 font-bold px-1 rounded-xs inline-block"
                    title={`Stop codon at position ${i + 1}`}
                  >
                    *
                  </span>
                );
              }
              if (char === 'M') {
                return (
                  <span
                    key={i}
                    className="bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 font-bold px-1 rounded-xs inline-block"
                    title={`Methionine / Start at position ${i + 1}`}
                  >
                    M
                  </span>
                );
              }
              return <span key={i}>{char}</span>;
            })}
          </div>
        </div>

        {/* Detected Open Reading Frames (ORFs) */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Detected Open Reading Frames (ATG Start → Stop)
            </h4>
            <span className="text-xs text-slate-500 font-mono">
              {activeFrameData.orfs.length} candidate coding regions
            </span>
          </div>

          {activeFrameData.orfs.length === 0 ? (
            <p className="text-xs text-slate-400 italic">
              No complete ATG-initiated open reading frames found in this frame.
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {activeFrameData.orfs.map((orf, oIdx) => (
                <div
                  key={oIdx}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sky-700 dark:text-sky-400 font-mono">
                        ORF #{oIdx + 1}
                      </span>
                      <span className="font-mono text-slate-600 dark:text-slate-400">
                        Span: {orf.startCodonPos}..{orf.stopCodonPos} bp ({orf.lengthBases} nt)
                      </span>
                      {oIdx === 0 && (
                        <span className="px-1.5 py-0.5 rounded-xs bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-semibold text-[10px]">
                          Longest CDS
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-[11px] text-slate-600 dark:text-slate-400 truncate max-w-xl">
                      {orf.protein}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {orf.lengthCodons} aa
                    </span>
                    <button
                      onClick={() => handleCopyProtein(orf.protein, 9999 + oIdx)}
                      className="px-2 py-1 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
                    >
                      Copy ORF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
