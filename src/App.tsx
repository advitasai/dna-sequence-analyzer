import React, { useState, useEffect } from 'react';
import { FastaRecord, MotifMatch } from './types/bioinformatics';
import {
  parseFasta,
  PRESET_SEQUENCES,
  sanitizeToCanonical,
} from './utils/dnaAnalyzer';
import { TopBar } from './components/TopBar';
import { FastaModal } from './components/FastaModal';
import { FastaRecordSelector } from './components/FastaRecordSelector';
import { SequenceOverview } from './components/SequenceOverview';
import { InteractiveSequenceViewer } from './components/InteractiveSequenceViewer';
import { TranslationSection } from './components/TranslationSection';
import { ReverseComplementSection } from './components/ReverseComplementSection';
import { MotifFinderSection } from './components/MotifFinderSection';
import { SixFramesSection } from './components/SixFramesSection';
import { CodonTableSection } from './components/CodonTableSection';
import { PythonRunnerModal } from './components/PythonRunnerModal';
import { ExportModal } from './components/ExportModal';

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('dna_analyzer_theme') === 'dark' ||
        (!('dna_analyzer_theme' in localStorage) &&
          window.matchMedia('(prefers-color-scheme: dark)').matches)
      );
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('dna_analyzer_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('dna_analyzer_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  // Load initial preset (GFP and Insulin multi-record)
  const [records, setRecords] = useState<FastaRecord[]>(() => {
    const initialText = `${PRESET_SEQUENCES[0].fastaContent}\n\n${PRESET_SEQUENCES[1].fastaContent}`;
    return parseFasta(initialText);
  });

  const [activeRecordIndex, setActiveRecordIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Modals state
  const [isFastaModalOpen, setIsFastaModalOpen] = useState(false);
  const [isPythonModalOpen, setIsPythonModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Active motif highlighting
  const [activeMotifMatches, setActiveMotifMatches] = useState<MotifMatch[]>([]);
  const [selectedMotifPos, setSelectedMotifPos] = useState<number | null>(null);

  const activeRecord = records[activeRecordIndex] || records[0];

  const handleLoadRecords = (newRecords: FastaRecord[]) => {
    if (newRecords.length > 0) {
      setRecords(newRecords);
      setActiveRecordIndex(0);
      setSelectedMotifPos(null);
    }
  };

  const handleSanitizeCurrentRecord = () => {
    if (!activeRecord) return;
    const sanitizedSeq = sanitizeToCanonical(activeRecord.sequence);
    const updated: FastaRecord = {
      ...activeRecord,
      sequence: sanitizedSeq,
      valid: true,
      invalidCharacters: [],
    };
    const nextRecords = [...records];
    nextRecords[activeRecordIndex] = updated;
    setRecords(nextRecords);
  };

  const handleSelectMotifMatch = (pos: number) => {
    setSelectedMotifPos(pos);
    setActiveTab('sequence');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-sky-500 selection:text-white">
      {/* Top Bar Navigation */}
      <TopBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenFastaModal={() => setIsFastaModalOpen(true)}
        onOpenPythonModal={() => setIsPythonModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        activeSequenceName={activeRecord?.id || 'Sequence'}
        sequenceCount={records.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Multi-Record FASTA Selector */}
        <FastaRecordSelector
          records={records}
          activeIndex={activeRecordIndex}
          onSelectIndex={(idx) => {
            setActiveRecordIndex(idx);
            setSelectedMotifPos(null);
          }}
          onOpenLoadModal={() => setIsFastaModalOpen(true)}
        />

        {/* Tab Views */}
        {activeRecord && (
          <div className="space-y-6">
            {/* TAB: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <SequenceOverview
                  record={activeRecord}
                  onSanitize={handleSanitizeCurrentRecord}
                />
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Sequence Preview (first 180 bp)
                  </h3>
                  <InteractiveSequenceViewer
                    record={{
                      ...activeRecord,
                      sequence: activeRecord.sequence.substring(0, 180),
                    }}
                    activeMotifMatches={activeMotifMatches.filter((m) => m.position <= 180)}
                    selectedMotifPos={selectedMotifPos}
                    onSelectPosition={(pos) => setSelectedMotifPos(pos)}
                  />
                </div>
              </div>
            )}

            {/* TAB: Full Sequence Viewer */}
            {activeTab === 'sequence' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white font-mono">
                      {activeRecord.id}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Interactive nucleotide inspector with Watson-Crick hydrogen bonding and motif match tags
                    </p>
                  </div>
                  {activeMotifMatches.length > 0 && (
                    <span className="text-xs font-mono text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-800">
                      {activeMotifMatches.length} motif matches highlighted
                    </span>
                  )}
                </div>

                <InteractiveSequenceViewer
                  record={activeRecord}
                  activeMotifMatches={activeMotifMatches}
                  selectedMotifPos={selectedMotifPos}
                  onSelectPosition={(pos) => setSelectedMotifPos(pos)}
                />
              </div>
            )}

            {/* TAB: Transcription & Translation */}
            {activeTab === 'translation' && (
              <TranslationSection record={activeRecord} />
            )}

            {/* TAB: Reverse Complement */}
            {activeTab === 'reverse_comp' && (
              <ReverseComplementSection record={activeRecord} />
            )}

            {/* TAB: Motif Finder */}
            {activeTab === 'motif' && (
              <MotifFinderSection
                record={activeRecord}
                onSelectMatch={handleSelectMotifMatch}
                selectedPos={selectedMotifPos}
                onMotifChange={(matches) => setActiveMotifMatches(matches)}
              />
            )}

            {/* TAB: Reading Frames & ORFs */}
            {activeTab === 'orfs' && <SixFramesSection record={activeRecord} />}

            {/* TAB: Genetic Code Table */}
            {activeTab === 'codons' && <CodonTableSection />}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-xs text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              DNA Sequence Analyzer
            </span>
            <span>·</span>
            <span>Biotechnology & Molecular Biology Suite</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => setIsPythonModalOpen(true)}
              className="text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
            >
              Python Implementation
            </button>
            <button
              onClick={() => setIsFastaModalOpen(true)}
              className="text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
            >
              Load FASTA
            </button>
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
            >
              Export Records
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <FastaModal
        isOpen={isFastaModalOpen}
        onClose={() => setIsFastaModalOpen(false)}
        onLoadRecords={handleLoadRecords}
        currentRecords={records}
      />

      {activeRecord && (
        <PythonRunnerModal
          isOpen={isPythonModalOpen}
          onClose={() => setIsPythonModalOpen(false)}
          record={activeRecord}
        />
      )}

      {activeRecord && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          record={activeRecord}
          allRecords={records}
        />
      )}
    </div>
  );
}
