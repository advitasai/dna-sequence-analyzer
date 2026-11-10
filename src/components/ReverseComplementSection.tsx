import React, { useState } from 'react';
import { FastaRecord } from '../types/bioinformatics';
import { complementStrand, reverseComplement, wrapSequence } from '../utils/dnaAnalyzer';
import { Copy, Check, ArrowRightLeft, FileDown, Info } from 'lucide-react';

interface ReverseComplementSectionProps {
  record: FastaRecord;
}

export const ReverseComplementSection: React.FC<ReverseComplementSectionProps> = ({
  record,
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const seq = record.sequence;
  const directComp = complementStrand(seq);
  const revComp = reverseComplement(seq);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDownloadFasta = () => {
    const content = `>${record.id}_reverse_complement ${record.description || ''} [rev-comp 5'-3']\n${wrapSequence(revComp, 60)}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${record.id}_revcomp.fasta`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Reverse Complement Strand Generation
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Antiparallel Watson-Crick DNA base pairing rules (A=T, G≡C)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadFasta}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Download Rev-Comp FASTA</span>
            </button>
          </div>
        </div>

        {/* Watson-Crick Pairing Infobox */}
        <div className="mt-4 p-4 rounded-lg bg-sky-50/70 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900 text-xs text-slate-700 dark:text-slate-300 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-sky-900 dark:text-sky-300">
            <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
            <span>Biotechnology Principle: Antiparallel Watson-Crick DNA Complementarity</span>
          </div>
          <p className="leading-relaxed">
            DNA strands run in opposite directions: one runs <strong>5' to 3'</strong>, and its complementary strand runs <strong>3' to 5'</strong>. In molecular biology and PCR primer design, oligonucleotides are always synthesized and written in standard <strong>5' to 3'</strong> direction. Thus, we first calculate the complement (A↔T, G↔C) and then invert the string backwards to get the <strong>Reverse Complement</strong>.
          </p>
          <div className="flex flex-wrap gap-4 pt-1 font-mono text-[11px]">
            <span className="text-emerald-700 dark:text-emerald-400">A = T (2 Hydrogen Bonds)</span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-amber-700 dark:text-amber-400">G ≡ C (3 Hydrogen Bonds)</span>
          </div>
        </div>

        {/* 3 Strands Visual Display */}
        <div className="space-y-4 mt-6">
          {/* Strand 1: Original Coding Strand 5' -> 3' */}
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <span className="font-mono text-sky-600">5' → 3'</span> Original Coding Strand (Sense)
              </span>
              <button
                onClick={() => handleCopy(seq, 'orig')}
                className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
              >
                {copiedType === 'orig' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'orig' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 break-all select-all tracking-wider">
              {seq}
            </div>
          </div>

          {/* Strand 2: Antiparallel Direct Complement 3' -> 5' */}
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <span className="font-mono text-amber-600">3' → 5'</span> Antiparallel Complement Strand (Template)
              </span>
              <button
                onClick={() => handleCopy(directComp, 'direct')}
                className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
              >
                {copiedType === 'direct' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'direct' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-600 dark:text-slate-300 break-all select-all tracking-wider">
              {directComp}
            </div>
            <span className="text-[11px] text-slate-400 block font-mono">
              Base-by-base complement without string inversion
            </span>
          </div>

          {/* Strand 3: Reverse Complement 5' -> 3' */}
          <div className="bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                <span className="font-mono text-emerald-600 font-extrabold">5' → 3'</span> Reverse Complement Strand (Standard Output)
              </span>
              <button
                onClick={() => handleCopy(revComp, 'revcomp')}
                className="text-xs text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200 flex items-center gap-1 font-semibold cursor-pointer"
              >
                {copiedType === 'revcomp' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'revcomp' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-md border border-emerald-300 dark:border-emerald-800 font-mono text-xs font-semibold text-emerald-900 dark:text-emerald-200 break-all select-all tracking-wider">
              {revComp}
            </div>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 block font-mono">
              Inverted to 5' to 3' orientation (Ready for PCR reverse primer design and sequencing alignments)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
