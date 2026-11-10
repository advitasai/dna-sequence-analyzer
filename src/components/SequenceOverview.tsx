import React from 'react';
import { BaseCounts, FastaRecord } from '../types/bioinformatics';
import {
  calculateMeltingTemperature,
  calculateMolecularWeight,
  countBases,
  gcContent,
} from '../utils/dnaAnalyzer';
import { AlertCircle, CheckCircle, Wrench, Copy, Check } from 'lucide-react';

interface SequenceOverviewProps {
  record: FastaRecord;
  onSanitize: () => void;
}

export const SequenceOverview: React.FC<SequenceOverviewProps> = ({
  record,
  onSanitize,
}) => {
  const [copied, setCopied] = React.useState(false);
  const seq = record.sequence;
  const counts: BaseCounts = countBases(seq);
  const gcPct = gcContent(seq);
  const atPct = 100 - gcPct;
  const tm = calculateMeltingTemperature(seq);
  const mwSs = calculateMolecularWeight(seq, 'ssDNA');
  const mwDs = calculateMolecularWeight(seq, 'dsDNA');

  const baseConfig = [
    {
      base: 'A',
      name: 'Adenine',
      count: counts.A,
      pct: seq.length > 0 ? (counts.A / seq.length) * 100 : 0,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-700 dark:text-emerald-400',
      bgLight: 'bg-emerald-50 dark:bg-emerald-950/40',
      pair: 'T (2 H-bonds)',
    },
    {
      base: 'T',
      name: 'Thymine',
      count: counts.T,
      pct: seq.length > 0 ? (counts.T / seq.length) * 100 : 0,
      color: 'bg-rose-500',
      textColor: 'text-rose-700 dark:text-rose-400',
      bgLight: 'bg-rose-50 dark:bg-rose-950/40',
      pair: 'A (2 H-bonds)',
    },
    {
      base: 'G',
      name: 'Guanine',
      count: counts.G,
      pct: seq.length > 0 ? (counts.G / seq.length) * 100 : 0,
      color: 'bg-amber-500',
      textColor: 'text-amber-700 dark:text-amber-400',
      bgLight: 'bg-amber-50 dark:bg-amber-950/40',
      pair: 'C (3 H-bonds)',
    },
    {
      base: 'C',
      name: 'Cytosine',
      count: counts.C,
      pct: seq.length > 0 ? (counts.C / seq.length) * 100 : 0,
      color: 'bg-sky-500',
      textColor: 'text-sky-700 dark:text-sky-400',
      bgLight: 'bg-sky-50 dark:bg-sky-950/40',
      pair: 'G (3 H-bonds)',
    },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(seq);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Info & Sanitize Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                FASTA ID
              </span>
              <h1 className="text-base font-bold text-slate-900 dark:text-white font-mono">
                {record.id}
              </h1>
            </div>
            {record.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {record.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Copy Sequence</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Validation Status */}
        {!record.valid && (
          <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-800 dark:text-amber-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                Found <strong>{record.invalidCharacters.length}</strong> non-canonical
                characters (e.g. {record.invalidCharacters.slice(0, 5).map(c => `'${c.char}'`).join(', ')}).
                Bioinformatics standard analysis requires canonical A, T, G, C.
              </span>
            </div>
            <button
              onClick={onSanitize}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-md shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <Wrench className="w-3 h-3" />
              Sanitize Sequence (Keep ATGC only)
            </button>
          </div>
        )}
      </div>

      {/* 4-Column KPI Strip according to Science & Biotech Reference */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Length */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            Sequence Length
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {seq.length.toLocaleString()}
            </span>
            <span className="text-xs uppercase font-mono text-slate-400">bp / nt</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
            {Math.floor(seq.length / 3)} triplets / codons
          </span>
        </div>

        {/* Metric 2: GC Content */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            GC Content
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tabular-nums text-sky-600 dark:text-sky-400">
              {gcPct.toFixed(2)}
            </span>
            <span className="text-xs uppercase font-mono text-slate-400">%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden flex">
            <div
              className="bg-sky-500 h-full transition-all duration-300"
              style={{ width: `${gcPct}%` }}
              title={`GC: ${gcPct.toFixed(2)}%`}
            />
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${atPct}%` }}
              title={`AT: ${atPct.toFixed(2)}%`}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
            <span>GC {gcPct.toFixed(1)}%</span>
            <span>AT {atPct.toFixed(1)}%</span>
          </div>
        </div>

        {/* Metric 3: Melting Temperature (Tm) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            Melting Temp (Tm)
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {tm.toFixed(1)}
            </span>
            <span className="text-xs uppercase font-mono text-slate-400">°C</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
            {seq.length < 14 ? 'Wallace rule (2·AT + 4·GC)' : 'Marmur-Doty formula'}
          </span>
        </div>

        {/* Metric 4: Molecular Weight */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            Molecular Weight
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {(mwSs / 1000).toFixed(2)}
            </span>
            <span className="text-xs uppercase font-mono text-slate-400">kDa (ss)</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
            dsDNA: {(mwDs / 1000).toFixed(2)} kDa
          </span>
        </div>
      </div>

      {/* Nucleotide Base Counts Breakdown Cards */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Nucleotide Base Composition & Frequency
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Total Bases: {counts.total}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {baseConfig.map((item) => (
            <div
              key={item.base}
              className={`p-3.5 rounded-lg border border-slate-100 dark:border-slate-800/80 ${item.bgLight} transition-colors`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xl font-bold font-mono ${item.textColor}`}>
                  {item.base}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {item.name}
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-lg font-bold font-mono tabular-nums text-slate-800 dark:text-slate-100">
                  {item.count.toLocaleString()}
                </span>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  {item.pct.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-200/50 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className={`${item.color} h-full rounded-full`}
                  style={{ width: `${item.pct}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 block">
                Pairs with {item.pair}
              </span>
            </div>
          ))}
        </div>

        {/* Chargaff Rule & Ratios */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center justify-between p-2 rounded-md bg-slate-50 dark:bg-slate-800/40">
            <span className="text-slate-500 dark:text-slate-400">A / T Ratio:</span>
            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
              {counts.T > 0 ? (counts.A / counts.T).toFixed(2) : 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-md bg-slate-50 dark:bg-slate-800/40">
            <span className="text-slate-500 dark:text-slate-400">G / C Ratio:</span>
            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
              {counts.C > 0 ? (counts.G / counts.C).toFixed(2) : 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-md bg-slate-50 dark:bg-slate-800/40">
            <span className="text-slate-500 dark:text-slate-400">Purine (A+G) vs Pyrimidine (T+C):</span>
            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
              {(counts.A + counts.G).toLocaleString()} / {(counts.T + counts.C).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
