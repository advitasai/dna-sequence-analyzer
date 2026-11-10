import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  FileCode,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { FastaRecord, PresetSequence } from '../types/bioinformatics';
import { parseFasta, PRESET_SEQUENCES } from '../utils/dnaAnalyzer';

interface FastaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadRecords: (records: FastaRecord[]) => void;
  currentRecords: FastaRecord[];
}

export const FastaModal: React.FC<FastaModalProps> = ({
  isOpen,
  onClose,
  onLoadRecords,
  currentRecords,
}) => {
  const [fastaText, setFastaText] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<FastaRecord[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize with current records if empty
  useEffect(() => {
    if (isOpen) {
      if (currentRecords.length > 0 && !fastaText) {
        const text = currentRecords
          .map((r) => `>${r.rawHeader}\n${r.sequence}`)
          .join('\n\n');
        setFastaText(text);
      }
    }
  }, [isOpen, currentRecords]);

  // Live parse fastaText whenever it changes
  useEffect(() => {
    if (!fastaText.trim()) {
      setParsedPreview([]);
      return;
    }
    const recs = parseFasta(fastaText);
    setParsedPreview(recs);
  }, [fastaText]);

  if (!isOpen) return null;

  const handleFileUpload = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setFastaText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handlePresetSelect = (preset: PresetSequence) => {
    setSelectedPresetId(preset.id);
    setFileName(`${preset.id}.fasta`);
    setFastaText(preset.fastaContent);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedPreview.length === 0) return;
    onLoadRecords(parsedPreview);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col my-auto transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 rounded-lg">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Load DNA / FASTA Sequences
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Upload a .fasta / .txt file, paste sequences, or load curated biotechnology benchmarks
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Quick Benchmark Presets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Curated Biotechnology Benchmarks
              </span>
              <span className="text-xs text-slate-400">1-click load</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {PRESET_SEQUENCES.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className={`text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200 ring-1 ring-sky-500/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-semibold text-xs truncate text-slate-900 dark:text-white">
                        {preset.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {preset.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* File Upload Dropzone */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Upload File or Drag & Drop
              </label>
              {fileName && (
                <span className="text-xs text-sky-600 dark:text-sky-400 font-mono truncate max-w-[240px]">
                  {fileName}
                </span>
              )}
            </div>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors ${
                dragOver
                  ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/20'
                  : 'border-slate-300 dark:border-slate-700 hover:border-sky-400 bg-slate-50/30 dark:bg-slate-800/20'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".fasta,.fa,.fna,.txt,.seq"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
              <Upload className="w-6 h-6 mx-auto mb-2 text-slate-400 dark:text-slate-500" />
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Click to browse or drop a FASTA file here
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Supports single-record and multi-record FASTA (.fasta, .fa, .fna, .txt)
              </p>
            </div>
          </div>

          {/* Direct FASTA Text Input Area */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="fastaTextarea"
                className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >
                FASTA Sequence Content
              </label>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span>
                  Records detected:{' '}
                  <strong className="text-slate-800 dark:text-slate-200 font-mono">
                    {parsedPreview.length}
                  </strong>
                </span>
                {fastaText && (
                  <button
                    type="button"
                    onClick={() => {
                      setFastaText('');
                      setFileName(null);
                      setSelectedPresetId('');
                    }}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>
            </div>

            <textarea
              id="fastaTextarea"
              rows={6}
              value={fastaText}
              onChange={(e) => {
                setFastaText(e.target.value);
                setSelectedPresetId('');
              }}
              placeholder={`>Example_Sequence_01 Homo sapiens mRNA snippet
ATGGTGCATCTGACTCCTGAGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAGGTGAAC
GTGGATGAAGTTGGTGGTGAGGCCCTGGGCAGGCTGCTGGTGGTCTACCCTTGGACCCAG`}
              className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-y"
            />
          </div>

          {/* Parsed Summary Preview */}
          {parsedPreview.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-lg p-3 space-y-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Sequence Records to Import ({parsedPreview.length})
              </span>
              <div className="max-h-36 overflow-y-auto space-y-1.5 divide-y divide-slate-100 dark:divide-slate-800">
                {parsedPreview.map((rec, i) => (
                  <div key={i} className="pt-1.5 first:pt-0 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate max-w-[70%]">
                      {rec.valid ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      )}
                      <span className="font-mono font-medium text-slate-800 dark:text-slate-200 truncate">
                        &gt;{rec.id}
                      </span>
                      {rec.description && (
                        <span className="text-slate-500 dark:text-slate-400 truncate text-[11px]">
                          {rec.description}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px] shrink-0">
                      <span>{rec.sequence.length.toLocaleString()} bp</span>
                      {!rec.valid && (
                        <span className="text-amber-600 dark:text-amber-400">
                          {rec.invalidCharacters.length} non-ATGC
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {parsedPreview.length > 0
              ? `Ready to import ${parsedPreview.length} ${
                  parsedPreview.length === 1 ? 'sequence' : 'sequences'
                }`
              : 'Paste or upload FASTA text above to analyze'}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={parsedPreview.length === 0}
              className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Load & Analyze Sequence{parsedPreview.length > 1 ? 's' : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
