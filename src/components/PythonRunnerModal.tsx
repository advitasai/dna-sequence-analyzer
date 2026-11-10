import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Download, Play, BookOpen } from 'lucide-react';
import { FastaRecord } from '../types/bioinformatics';
import {
  countBases,
  findMotif,
  gcContent,
  getPythonSourceCode,
  reverseComplement,
  transcribe,
  translate,
} from '../utils/dnaAnalyzer';

interface PythonRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: FastaRecord;
}

export const PythonRunnerModal: React.FC<PythonRunnerModalProps> = ({
  isOpen,
  onClose,
  record,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'console' | 'code' | 'curriculum'>('console');
  const [testMotif, setTestMotif] = useState('ATG');
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const pythonSource = getPythonSourceCode();
  const seq = record.sequence;
  const counts = countBases(seq);
  const gc = gcContent(seq);
  const revComp = reverseComplement(seq);
  const mrna = transcribe(seq);
  const protein = translate(seq, true);
  const motifPositions = findMotif(seq, testMotif, false).map((m) => m.position);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pythonSource);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadPython = () => {
    const blob = new Blob([pythonSource], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dna_analyzer.py';
    link.click;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col my-auto transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Biotech Python Lab Companion
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Compare Python implementation with live sequence execution side-by-side
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPython}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Download .py</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub Navigation Bar */}
        <div className="flex items-center px-6 pt-3 border-b border-slate-100 dark:border-slate-800 gap-4 text-xs font-medium">
          <button
            onClick={() => setActiveSubTab('console')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeSubTab === 'console'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Interactive Terminal Output</span>
          </button>
          <button
            onClick={() => setActiveSubTab('code')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeSubTab === 'code'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Python Source Code</span>
          </button>
          <button
            onClick={() => setActiveSubTab('curriculum')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeSubTab === 'curriculum'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Curriculum Explanations</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* TAB 1: Live Interactive Terminal Output */}
          {activeSubTab === 'console' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">
                  Simulated execution of <code className="font-mono text-emerald-600">python dna_analyzer.py</code> on sequence <strong>{record.id}</strong>:
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Motif to search:</span>
                  <input
                    type="text"
                    value={testMotif}
                    onChange={(e) => setTestMotif(e.target.value.toUpperCase())}
                    className="w-20 px-2 py-0.5 font-mono text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-sm uppercase text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Terminal Window */}
              <div className="bg-slate-950 text-emerald-400 font-mono text-xs p-5 rounded-lg border border-slate-800 shadow-inner overflow-x-auto leading-relaxed select-text">
                <p className="text-slate-500 select-none">$ python dna_analyzer.py</p>
                <p className="mt-2 text-slate-200">
                  Enter a DNA sequence (A, T, G, C):{' '}
                  <span className="text-emerald-300 truncate inline-block max-w-[400px] align-bottom">
                    {seq.substring(0, 50)}...
                  </span>
                </p>
                <p className="mt-3 text-slate-400 select-none">--- Results ---</p>
                <p>Length: {seq.length} bases</p>
                <p>
                  Base counts: &#123;'A': {counts.A}, 'T': {counts.T}, 'G': {counts.G}, 'C': {counts.C}&#125;
                </p>
                <p>GC content: {gc.toFixed(2)}%</p>
                <p className="break-all">Reverse complement: {revComp}</p>
                <p className="break-all text-sky-300">mRNA: {mrna}</p>
                <p className="break-all text-amber-300">Protein: {protein}</p>
                <p className="mt-3 text-slate-200">
                  Enter a motif to search for (e.g. ATG):{' '}
                  <span className="text-yellow-400 font-bold">{testMotif}</span>
                </p>
                {motifPositions.length > 0 ? (
                  <p className="text-yellow-300 font-semibold">
                    Motif found at positions: [{motifPositions.join(', ')}]
                  </p>
                ) : (
                  <p className="text-slate-400">Motif not found.</p>
                )}
                <p className="mt-4 text-slate-600 select-none">
                  [Process finished with exit code 0]
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Full Python Source Code */}
          {activeSubTab === 'code' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  File: <code className="font-mono text-slate-800 dark:text-slate-200">dna_analyzer.py</code>
                </span>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-md hover:bg-slate-200 cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy Python Code'}</span>
                </button>
              </div>

              <div className="p-4 bg-slate-950 text-slate-200 font-mono text-xs rounded-lg border border-slate-800 overflow-x-auto max-h-[500px] leading-relaxed">
                <pre>{pythonSource}</pre>
              </div>
            </div>
          )}

          {/* TAB 3: Biotechnology Student Curriculum Guide */}
          {activeSubTab === 'curriculum' && (
            <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  1. Sequence Cleaning & Validation
                </h3>
                <p>
                  Biological sequence files often contain whitespace, line breaks from FASTA wrapping, or accidental numbers. The function <code>clean_sequence()</code> strips all spacing, uppercases the characters, and throws a <code>ValueError</code> if invalid non-ATGC bases are encountered.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  2. Base Counting & GC Content
                </h3>
                <p>
                  GC pairs are connected by 3 hydrogen bonds, while AT pairs have only 2. Higher GC content increases DNA stability and raises the melting temperature (Tm) required during PCR denaturation. <code>gc_content()</code> computes <code>(G + C) / total * 100</code>.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  3. Reverse Complement
                </h3>
                <p>
                  DNA is antiparallel. To synthesize primers or sequence the bottom strand, you complement each base (A↔T, G↔C) and then slice backwards with Python's slice syntax <code>[::-1]</code> to output standard 5'→3' orientation.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  4. Transcription & Translation
                </h3>
                <p>
                  RNA Polymerase synthesizes mRNA where Uracil (U) replaces Thymine (T). Ribosomes read triplets (codons) in reading frames of 3 bases from 5' to 3', looking up transfer RNAs (tRNAs) matching the NCBI genetic code until reaching a stop codon (*).
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  5. Motif Searching (1-based Coordinates)
                </h3>
                <p>
                  In computer science strings are 0-indexed, but in international bioinformatics standards (GenBank, Ensembl, BLAST), genome coordinates are 1-based. The function <code>find_motif()</code> appends <code>i + 1</code> so students can directly cross-reference published restriction enzyme and promoter maps.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
