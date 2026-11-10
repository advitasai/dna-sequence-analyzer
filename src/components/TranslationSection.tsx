import React, { useState, useMemo } from 'react';
import { FastaRecord } from '../types/bioinformatics';
import {
  AMINO_ACID_DETAILS,
  CODON_TABLE,
  transcribe,
  translate,
} from '../utils/dnaAnalyzer';
import { ArrowRight, Copy, Check, FileDown, Layers } from 'lucide-react';

interface TranslationSectionProps {
  record: FastaRecord;
}

export const TranslationSection: React.FC<TranslationSectionProps> = ({ record }) => {
  const [stopAtFirstStop, setStopAtFirstStop] = useState(true);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const seq = record.sequence;
  const mrna = useMemo(() => transcribe(seq), [seq]);
  const protein = useMemo(
    () => translate(seq, stopAtFirstStop),
    [seq, stopAtFirstStop]
  );

  // Codon table breakdown
  const codonList = useMemo(() => {
    const list: Array<{
      index: number;
      dnaCodon: string;
      rnaCodon: string;
      aa: string;
      info?: typeof AMINO_ACID_DETAILS[string];
    }> = [];

    for (let i = 0; i <= seq.length - 3; i += 3) {
      const dnaCodon = seq.substring(i, i + 3);
      const rnaCodon = dnaCodon.replace(/T/g, 'U');
      const aa = CODON_TABLE[dnaCodon] || '?';
      const info = AMINO_ACID_DETAILS[aa];

      list.push({
        index: i / 3 + 1,
        dnaCodon,
        rnaCodon,
        aa,
        info,
      });

      if (stopAtFirstStop && aa === '*') {
        break;
      }
    }

    return list;
  }, [seq, stopAtFirstStop]);

  // Amino acid chemical category distribution
  const compositionStats = useMemo(() => {
    const stats = {
      hydrophobic: 0,
      polar: 0,
      basic: 0,
      acidic: 0,
      special: 0,
      stop: 0,
      totalWeight: 0,
    };

    for (const item of codonList) {
      if (!item.info) continue;
      const cat = item.info.category;
      if (cat === 'hydrophobic') stats.hydrophobic++;
      else if (cat === 'polar') stats.polar++;
      else if (cat === 'basic') stats.basic++;
      else if (cat === 'acidic') stats.acidic++;
      else if (cat === 'special') stats.special++;
      else if (cat === 'stop') stats.stop++;

      stats.totalWeight += item.info.weight;
    }

    // Subtract water mass (18.015 Da) per peptide bond formed
    if (codonList.length > 1) {
      stats.totalWeight -= (codonList.length - 1) * 18.015;
    }

    return stats;
  }, [codonList]);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards: Central Dogma of Molecular Biology */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Transcription & Translation Engine
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Converts DNA coding strand to mRNA transcript and translates through standard codon table
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={stopAtFirstStop}
                onChange={(e) => setStopAtFirstStop(e.target.checked)}
                className="rounded-sm border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <span>Stop at first STOP codon (Python default)</span>
            </label>
          </div>
        </div>

        {/* 3 Steps Pipeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          {/* Step 1: DNA Coding */}
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                1. DNA Coding Strand
              </span>
              <button
                onClick={() => handleCopy(seq, 'dna')}
                className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
              >
                {copiedType === 'dna' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'dna' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="font-mono text-xs text-slate-700 dark:text-slate-300 break-all line-clamp-4 bg-white dark:bg-slate-900 p-2.5 rounded-md border border-slate-100 dark:border-slate-800">
              {seq}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-mono">
              Length: {seq.length} bases
            </span>
          </div>

          {/* Step 2: mRNA Transcript */}
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                2. mRNA Transcript (T → U)
              </span>
              <button
                onClick={() => handleCopy(mrna, 'mrna')}
                className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
              >
                {copiedType === 'mrna' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'mrna' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="font-mono text-xs text-rose-700 dark:text-rose-300 break-all line-clamp-4 bg-white dark:bg-slate-900 p-2.5 rounded-md border border-slate-100 dark:border-slate-800">
              {mrna}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-mono">
              Thymine (T) replaced by Uracil (U)
            </span>
          </div>

          {/* Step 3: Protein Sequence */}
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                3. Translated Protein
              </span>
              <button
                onClick={() => handleCopy(protein, 'protein')}
                className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
              >
                {copiedType === 'protein' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'protein' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="font-mono text-xs font-bold text-sky-800 dark:text-sky-300 break-all line-clamp-4 bg-white dark:bg-slate-900 p-2.5 rounded-md border border-slate-100 dark:border-slate-800 tracking-wider">
              {protein || '(No protein translated)'}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-mono">
              {protein.length} amino acids · {(compositionStats.totalWeight / 1000).toFixed(2)} kDa
            </span>
          </div>
        </div>
      </div>

      {/* Amino Acid Chemistry & Property Breakdown */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
          Protein Residue Physicochemical Composition
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block">Hydrophobic / Aliphatic</span>
            <span className="text-lg font-bold font-mono text-slate-800 dark:text-slate-200">
              {compositionStats.hydrophobic}
            </span>
            <span className="text-[11px] text-slate-400 block font-mono">
              {protein.length > 0 ? ((compositionStats.hydrophobic / protein.length) * 100).toFixed(1) : 0}%
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block">Polar / Uncharged</span>
            <span className="text-lg font-bold font-mono text-slate-800 dark:text-slate-200">
              {compositionStats.polar}
            </span>
            <span className="text-[11px] text-slate-400 block font-mono">
              {protein.length > 0 ? ((compositionStats.polar / protein.length) * 100).toFixed(1) : 0}%
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block">Basic / Positively Charged</span>
            <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {compositionStats.basic}
            </span>
            <span className="text-[11px] text-slate-400 block font-mono">
              Arg, Lys, His
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block">Acidic / Negatively Charged</span>
            <span className="text-lg font-bold font-mono text-rose-600 dark:text-rose-400">
              {compositionStats.acidic}
            </span>
            <span className="text-[11px] text-slate-400 block font-mono">
              Asp, Glu
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block">Special (Pro, Cys, Gly)</span>
            <span className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">
              {compositionStats.special}
            </span>
            <span className="text-[11px] text-slate-400 block font-mono">
              Kinks & Disulfide bonds
            </span>
          </div>
        </div>
      </div>

      {/* Codon-by-Codon Translation Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Codon-by-Codon Triplet Map ({codonList.length} codons)
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Standard Universal Genetic Code
          </span>
        </div>

        <div className="max-h-96 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/80 sticky top-0 font-mono text-slate-600 dark:text-slate-300">
              <tr>
                <th className="py-2 px-3">#</th>
                <th className="py-2 px-3">DNA Codon</th>
                <th className="py-2 px-3">mRNA Codon</th>
                <th className="py-2 px-3">1-Letter</th>
                <th className="py-2 px-3">3-Letter</th>
                <th className="py-2 px-3">Full Amino Acid</th>
                <th className="py-2 px-3">Chemical Property</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {codonList.map((item) => {
                const isStop = item.aa === '*';
                const isStart = item.dnaCodon === 'ATG';

                return (
                  <tr
                    key={item.index}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                      isStop
                        ? 'bg-rose-50/50 dark:bg-rose-950/20'
                        : isStart
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20'
                        : ''
                    }`}
                  >
                    <td className="py-2 px-3 text-slate-400">{item.index}</td>
                    <td className="py-2 px-3 font-bold text-slate-900 dark:text-slate-100">
                      {item.dnaCodon}
                    </td>
                    <td className="py-2 px-3 text-rose-600 dark:text-rose-400">
                      {item.rnaCodon}
                    </td>
                    <td className="py-2 px-3 font-bold">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded-sm ${
                          isStop
                            ? 'bg-rose-200 text-rose-900 dark:bg-rose-900 dark:text-rose-200'
                            : isStart
                            ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {item.aa}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-semibold text-slate-700 dark:text-slate-300">
                      {item.info?.code3 || '-'}
                    </td>
                    <td className="py-2 px-3 font-sans font-medium text-slate-800 dark:text-slate-200">
                      {item.info?.name || '-'}
                      {isStart && <span className="text-emerald-600 ml-1 font-semibold text-[11px]">(Start)</span>}
                      {isStop && <span className="text-rose-600 ml-1 font-semibold text-[11px]">(Termination)</span>}
                    </td>
                    <td className="py-2 px-3 font-sans text-slate-500 capitalize">
                      {item.info?.category || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
