import React, { useState } from 'react';
import { X, Download, FileText, Check, Copy } from 'lucide-react';
import { FastaRecord } from '../types/bioinformatics';
import {
  calculateMeltingTemperature,
  calculateMolecularWeight,
  countBases,
  formatFasta,
  gcContent,
  reverseComplement,
  transcribe,
  translate,
  wrapSequence,
} from '../utils/dnaAnalyzer';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: FastaRecord;
  allRecords: FastaRecord[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  record,
  allRecords,
}) => {
  const [exportScope, setExportScope] = useState<'current' | 'all'>('current');
  const [exportType, setExportType] = useState<
    'fasta_dna' | 'fasta_revcomp' | 'fasta_mrna' | 'fasta_protein' | 'report_txt' | 'csv'
  >('fasta_dna');
  const [wrapWidth, setWrapWidth] = useState<number>(60);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const getExportData = () => {
    const targets = exportScope === 'current' ? [record] : allRecords;

    if (exportType === 'fasta_dna') {
      const formatted = targets.map((r) => ({
        header: r.rawHeader || r.id,
        sequence: r.sequence,
      }));
      return {
        content: formatFasta(formatted, wrapWidth),
        filename: `${exportScope === 'current' ? record.id : 'multi_sequences'}.fasta`,
        mime: 'text/plain',
      };
    }

    if (exportType === 'fasta_revcomp') {
      const formatted = targets.map((r) => ({
        header: `${r.id}_revcomp ${r.description || ''}`,
        sequence: reverseComplement(r.sequence),
      }));
      return {
        content: formatFasta(formatted, wrapWidth),
        filename: `${record.id}_revcomp.fasta`,
        mime: 'text/plain',
      };
    }

    if (exportType === 'fasta_mrna') {
      const formatted = targets.map((r) => ({
        header: `${r.id}_mRNA ${r.description || ''}`,
        sequence: transcribe(r.sequence),
      }));
      return {
        content: formatFasta(formatted, wrapWidth),
        filename: `${record.id}_mrna.fasta`,
        mime: 'text/plain',
      };
    }

    if (exportType === 'fasta_protein') {
      const formatted = targets.map((r) => ({
        header: `${r.id}_protein ${r.description || ''}`,
        sequence: translate(r.sequence, true),
      }));
      return {
        content: formatFasta(formatted, wrapWidth),
        filename: `${record.id}_protein.faa`,
        mime: 'text/plain',
      };
    }

    if (exportType === 'report_txt') {
      const sections = targets.map((r) => {
        const counts = countBases(r.sequence);
        const gc = gcContent(r.sequence);
        const tm = calculateMeltingTemperature(r.sequence);
        const mw = calculateMolecularWeight(r.sequence, 'ssDNA');
        const prot = translate(r.sequence, true);

        return `================================================================================
SEQUENCE REPORT: ${r.id}
================================================================================
Header: ${r.rawHeader}
Description: ${r.description || 'N/A'}
Length: ${r.sequence.length} bases
GC Content: ${gc.toFixed(2)}%
Melting Temperature (Tm): ${tm.toFixed(1)} °C
Molecular Weight (ssDNA): ${(mw / 1000).toFixed(2)} kDa

BASE COUNTS:
  Adenine (A):  ${counts.A} (${((counts.A / r.sequence.length) * 100).toFixed(1)}%)
  Thymine (T):  ${counts.T} (${((counts.T / r.sequence.length) * 100).toFixed(1)}%)
  Guanine (G):  ${counts.G} (${((counts.G / r.sequence.length) * 100).toFixed(1)}%)
  Cytosine (C): ${counts.C} (${((counts.C / r.sequence.length) * 100).toFixed(1)}%)

DNA SEQUENCE (5'->3'):
${wrapSequence(r.sequence, wrapWidth)}

REVERSE COMPLEMENT (5'->3'):
${wrapSequence(reverseComplement(r.sequence), wrapWidth)}

mRNA TRANSCRIPT (5'->3'):
${wrapSequence(transcribe(r.sequence), wrapWidth)}

TRANSLATED PROTEIN:
${wrapSequence(prot, wrapWidth)}
`;
      });

      return {
        content: sections.join('\n\n'),
        filename: `${record.id}_analysis_report.txt`,
        mime: 'text/plain',
      };
    }

    // CSV format
    const rows = [
      ['ID', 'Description', 'Length (bp)', 'Count A', 'Count T', 'Count G', 'Count C', 'GC (%)', 'Tm (C)', 'MW (kDa)'],
      ...targets.map((r) => {
        const counts = countBases(r.sequence);
        const gc = gcContent(r.sequence);
        const tm = calculateMeltingTemperature(r.sequence);
        const mw = calculateMolecularWeight(r.sequence, 'ssDNA');
        return [
          `"${r.id}"`,
          `"${(r.description || '').replace(/"/g, '""')}"`,
          r.sequence.length,
          counts.A,
          counts.T,
          counts.G,
          counts.C,
          gc.toFixed(2),
          tm.toFixed(1),
          (mw / 1000).toFixed(2),
        ];
      }),
    ];

    return {
      content: rows.map((row) => row.join(',')).join('\n'),
      filename: `sequence_metrics.csv`,
      mime: 'text/csv',
    };
  };

  const { content, filename, mime } = getExportData();

  const handleDownload = () => {
    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full flex flex-col my-auto transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 rounded-lg">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Export Sequence Data
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Download formatted FASTA files, transcripts, translation products, or reports
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Scope Selector if multiple records exist */}
          {allRecords.length > 1 && (
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Export Target
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setExportScope('current')}
                  className={`px-3 py-1.5 rounded-lg border font-medium cursor-pointer ${
                    exportScope === 'current'
                      ? 'bg-sky-50 dark:bg-sky-950 border-sky-500 text-sky-700 dark:text-sky-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Current Sequence ({record.id})
                </button>
                <button
                  type="button"
                  onClick={() => setExportScope('all')}
                  className={`px-3 py-1.5 rounded-lg border font-medium cursor-pointer ${
                    exportScope === 'all'
                      ? 'bg-sky-50 dark:bg-sky-950 border-sky-500 text-sky-700 dark:text-sky-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  All {allRecords.length} Sequences (Multi-FASTA / Batch)
                </button>
              </div>
            </div>
          )}

          {/* Export Format Selector */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Format & Content
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'fasta_dna', label: 'DNA FASTA (.fasta)' },
                { id: 'fasta_revcomp', label: 'Rev-Comp FASTA (.fasta)' },
                { id: 'fasta_mrna', label: 'mRNA Transcript (.fasta)' },
                { id: 'fasta_protein', label: 'Protein (.faa)' },
                { id: 'report_txt', label: 'Full Analysis Report (.txt)' },
                { id: 'csv', label: 'Metrics Table (.csv)' },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setExportType(fmt.id as any)}
                  className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                    exportType === fmt.id
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/60 font-semibold text-sky-900 dark:text-sky-200 ring-1 ring-sky-500/30'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Line Wrap Width for FASTA */}
          {exportType.startsWith('fasta') && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400">FASTA Line Wrap:</span>
              <div className="flex items-center gap-1">
                {[60, 70, 80].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setWrapWidth(w)}
                    className={`px-2.5 py-1 rounded-sm font-mono cursor-pointer ${
                      wrapWidth === w
                        ? 'bg-sky-600 text-white font-bold'
                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {w} bp
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Preview Box */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span>Preview: <code className="font-mono text-slate-800 dark:text-slate-200">{filename}</code></span>
              <button
                type="button"
                onClick={handleCopy}
                className="hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-950 text-slate-300 font-mono text-[11px] rounded-lg border border-slate-800 max-h-40 overflow-y-auto leading-relaxed">
              {content.substring(0, 500)}
              {content.length > 500 && '\n... [truncated in preview]'}
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download {filename}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
