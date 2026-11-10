import React from 'react';
import { Dna, Upload, Download, Terminal, Sun, Moon, FileText } from 'lucide-react';

interface TopBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenFastaModal: () => void;
  onOpenPythonModal: () => void;
  onOpenExportModal: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  activeSequenceName: string;
  sequenceCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onTabChange,
  onOpenFastaModal,
  onOpenPythonModal,
  onOpenExportModal,
  isDarkMode,
  onToggleTheme,
  activeSequenceName,
  sequenceCount,
}) => {
  const navTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'sequence', label: 'Sequence Viewer' },
    { id: 'translation', label: 'Transcription & Translation' },
    { id: 'reverse_comp', label: 'Reverse Complement' },
    { id: 'motif', label: 'Motif Finder' },
    { id: 'orfs', label: 'Reading Frames' },
    { id: 'codons', label: 'Genetic Code Table' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Zone 1: Brand wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-sky-600 dark:bg-sky-500 text-white flex items-center justify-center shadow-sm">
              <Dna className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap block">
                DNA Sequence Analyzer
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1.5">
                <span className="truncate max-w-[160px] sm:max-w-[220px]" title={activeSequenceName}>
                  {activeSequenceName}
                </span>
                {sequenceCount > 1 && (
                  <span className="text-sky-600 dark:text-sky-400 font-medium">
                    +{sequenceCount - 1} more
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-1">
            {navTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-slate-100 dark:bg-slate-800 text-sky-700 dark:text-sky-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenFastaModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400 rounded-md shadow-xs transition-colors whitespace-nowrap cursor-pointer"
              title="Open or Upload FASTA File"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Load FASTA</span>
            </button>

            <button
              onClick={onOpenExportModal}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-md transition-colors whitespace-nowrap cursor-pointer"
              title="Export Sequence as FASTA or Text"
            >
              <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Export</span>
            </button>

            <button
              onClick={onOpenPythonModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-md transition-colors whitespace-nowrap cursor-pointer"
              title="View Python Source & Live Output"
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden md:inline">Python Code</span>
            </button>

            <button
              onClick={onToggleTheme}
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Horizontal Scrollable Tab Bar */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 dark:border-slate-800 no-scrollbar">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors shrink-0 ${
                  isActive
                    ? 'bg-slate-100 dark:bg-slate-800 text-sky-700 dark:text-sky-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
