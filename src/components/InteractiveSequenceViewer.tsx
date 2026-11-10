import React, { useState, useMemo } from 'react';
import { FastaRecord, MotifMatch } from '../types/bioinformatics';
import { complementStrand, CODON_TABLE, transcribe } from '../utils/dnaAnalyzer';
import { Eye, Copy, Check, Hash, Sliders } from 'lucide-react';

interface InteractiveSequenceViewerProps {
  record: FastaRecord;
  activeMotifMatches?: MotifMatch[];
  selectedMotifPos?: number | null;
  onSelectPosition?: (pos: number) => void;
}

type ViewMode = 'coding' | 'double_strand' | 'mrna' | 'translation';
type GroupMode = '10bp' | 'codon' | 'continuous';

export const InteractiveSequenceViewer: React.FC<InteractiveSequenceViewerProps> = ({
  record,
  activeMotifMatches = [],
  selectedMotifPos,
  onSelectPosition,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('coding');
  const [groupMode, setGroupMode] = useState<GroupMode>('10bp');
  const [lineWidth, setLineWidth] = useState<number>(60);
  const [copied, setCopied] = useState(false);
  const [hoveredPos, setHoveredPos] = useState<number | null>(null);

  const seq = record.sequence;
  const compSeq = useMemo(() => complementStrand(seq), [seq]);
  const mrnaSeq = useMemo(() => transcribe(seq), [seq]);

  // Index map of all motif matched positions for fast lookup
  const motifMatchIndices = useMemo(() => {
    const map = new Map<number, { match: MotifMatch; isStart: boolean }>();
    for (const m of activeMotifMatches) {
      for (let k = 0; k < m.match.length; k++) {
        map.set(m.index + k, { match: m, isStart: k === 0 });
      }
    }
    return map;
  }, [activeMotifMatches]);

  // Break sequence into rows of `lineWidth` bases
  const rows = useMemo(() => {
    const list: Array<{
      startIdx: number;
      dnaChunk: string;
      compChunk: string;
      mrnaChunk: string;
    }> = [];
    for (let i = 0; i < seq.length; i += lineWidth) {
      list.push({
        startIdx: i,
        dnaChunk: seq.substring(i, Math.min(seq.length, i + lineWidth)),
        compChunk: compSeq.substring(i, Math.min(seq.length, i + lineWidth)),
        mrnaChunk: mrnaSeq.substring(i, Math.min(seq.length, i + lineWidth)),
      });
    }
    return list;
  }, [seq, compSeq, mrnaSeq, lineWidth]);

  const getBaseColorClass = (base: string) => {
    switch (base) {
      case 'A':
        return 'text-emerald-700 dark:text-emerald-300 font-bold';
      case 'T':
      case 'U':
        return 'text-rose-700 dark:text-rose-300 font-bold';
      case 'G':
        return 'text-amber-700 dark:text-amber-300 font-bold';
      case 'C':
        return 'text-sky-700 dark:text-sky-300 font-bold';
      default:
        return 'text-slate-400 dark:text-slate-500';
    }
  };

  const handleCopyCurrent = () => {
    let textToCopy = seq;
    if (viewMode === 'mrna') textToCopy = mrnaSeq;
    if (viewMode === 'double_strand') {
      textToCopy = `5' ${seq} 3'\n3' ${compSeq} 5'`;
    }
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
      {/* Top Toolbar Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        {/* Left: View Mode Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg">
          <button
            onClick={() => setViewMode('coding')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              viewMode === 'coding'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            DNA Coding (5'→3')
          </button>
          <button
            onClick={() => setViewMode('double_strand')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              viewMode === 'double_strand'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Antiparallel Duplex (Watson-Crick)
          </button>
          <button
            onClick={() => setViewMode('mrna')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              viewMode === 'mrna'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            mRNA Transcript (T→U)
          </button>
          <button
            onClick={() => setViewMode('translation')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              viewMode === 'translation'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Codon Triplet Translation
          </button>
        </div>

        {/* Right: Grouping & Width Selectors */}
        <div className="flex items-center gap-3">
          {/* Grouping */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>Grouping:</span>
            <select
              value={groupMode}
              onChange={(e) => setGroupMode(e.target.value as GroupMode)}
              className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-slate-700 dark:text-slate-200 focus:outline-hidden"
            >
              <option value="10bp">10 bp Blocks</option>
              <option value="codon">3 bp (Codons)</option>
              <option value="continuous">Continuous</option>
            </select>
          </div>

          {/* Line Length */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>Row:</span>
            <select
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-slate-700 dark:text-slate-200 focus:outline-hidden"
            >
              <option value={30}>30 bp</option>
              <option value={50}>50 bp</option>
              <option value={60}>60 bp (FASTA standard)</option>
              <option value={90}>90 bp</option>
            </select>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopyCurrent}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
            title="Copy displayed sequence to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Legend & Hover Info Ribbon */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 px-3 py-2 rounded-lg">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Base Color Code:</span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" />
            <strong className="text-emerald-700 dark:text-emerald-400 font-mono">A</strong>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 inline-block" />
            <strong className="text-rose-700 dark:text-rose-400 font-mono">
              {viewMode === 'mrna' ? 'U' : 'T'}
            </strong>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block" />
            <strong className="text-amber-700 dark:text-amber-400 font-mono">G</strong>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-sky-500 inline-block" />
            <strong className="text-sky-700 dark:text-sky-400 font-mono">C</strong>
          </span>
        </div>

        {/* Hovered Base Telemetry */}
        <div className="font-mono text-xs">
          {hoveredPos !== null ? (
            <span className="text-slate-800 dark:text-slate-200">
              Pos: <strong>{hoveredPos}</strong> · Base:{' '}
              <strong className={getBaseColorClass(seq[hoveredPos - 1])}>
                {seq[hoveredPos - 1]}
              </strong>{' '}
              · Pairs with:{' '}
              <strong className={getBaseColorClass(compSeq[hoveredPos - 1])}>
                {compSeq[hoveredPos - 1]}
              </strong>
            </span>
          ) : (
            <span className="text-slate-400">Hover over any base to inspect position</span>
          )}
        </div>
      </div>

      {/* Sequence Matrix Canvas */}
      <div className="font-mono text-xs leading-relaxed overflow-x-auto p-4 bg-slate-50/70 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 select-text">
        <div className="space-y-4 min-w-[500px]">
          {rows.map((row, rIdx) => {
            const startCoord = row.startIdx + 1;
            const endCoord = Math.min(seq.length, row.startIdx + row.dnaChunk.length);

            return (
              <div
                key={rIdx}
                className="group relative pb-2 border-b border-slate-100 dark:border-slate-800/40 last:border-b-0"
              >
                {/* Coordinate label */}
                <div className="text-[10px] text-slate-400 font-mono mb-1 flex items-center justify-between">
                  <span>5' {startCoord}..{endCoord}</span>
                  {activeMotifMatches.length > 0 && (
                    <span className="text-amber-600 dark:text-amber-400">
                      {activeMotifMatches.filter(
                        (m) => m.position >= startCoord && m.position <= endCoord
                      ).length > 0 && 'Motif match on this row'}
                    </span>
                  )}
                </div>

                {/* 1. Single Coding Strand (5'->3') */}
                {viewMode === 'coding' && (
                  <div className="flex items-start">
                    <span className="w-12 text-slate-400 font-mono select-none shrink-0 text-right pr-3">
                      {startCoord}
                    </span>
                    <div className="flex flex-wrap gap-x-2 tracking-widest">
                      {renderGroupedBases(
                        row.dnaChunk,
                        row.startIdx,
                        groupMode,
                        motifMatchIndices,
                        selectedMotifPos,
                        setHoveredPos,
                        onSelectPosition
                      )}
                    </div>
                  </div>
                )}

                {/* 2. Antiparallel Duplex (Watson-Crick) */}
                {viewMode === 'double_strand' && (
                  <div className="space-y-0.5">
                    {/* Top Coding Strand 5' -> 3' */}
                    <div className="flex items-center">
                      <span className="w-12 text-slate-400 font-mono select-none shrink-0 text-right pr-3">
                        5'
                      </span>
                      <div className="flex flex-wrap gap-x-2 tracking-widest">
                        {renderGroupedBases(
                          row.dnaChunk,
                          row.startIdx,
                          groupMode,
                          motifMatchIndices,
                          selectedMotifPos,
                          setHoveredPos,
                          onSelectPosition
                        )}
                      </div>
                    </div>

                    {/* Hydrogen Bonds Row: || for AT, ||| for GC */}
                    <div className="flex items-center text-slate-300 dark:text-slate-700 text-[10px] select-none">
                      <span className="w-12 select-none shrink-0" />
                      <div className="flex flex-wrap gap-x-2 tracking-widest">
                        {renderHydrogenBonds(row.dnaChunk, groupMode)}
                      </div>
                    </div>

                    {/* Bottom Template Strand 3' -> 5' */}
                    <div className="flex items-center">
                      <span className="w-12 text-slate-400 font-mono select-none shrink-0 text-right pr-3">
                        3'
                      </span>
                      <div className="flex flex-wrap gap-x-2 tracking-widest">
                        {renderGroupedBases(
                          row.compChunk,
                          row.startIdx,
                          groupMode,
                          new Map(),
                          null,
                          setHoveredPos,
                          onSelectPosition,
                          true
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. mRNA Transcript (T->U) */}
                {viewMode === 'mrna' && (
                  <div className="flex items-start">
                    <span className="w-12 text-slate-400 font-mono select-none shrink-0 text-right pr-3">
                      mRNA
                    </span>
                    <div className="flex flex-wrap gap-x-2 tracking-widest">
                      {renderGroupedBases(
                        row.mrnaChunk,
                        row.startIdx,
                        groupMode,
                        motifMatchIndices,
                        selectedMotifPos,
                        setHoveredPos,
                        onSelectPosition
                      )}
                    </div>
                  </div>
                )}

                {/* 4. Codon Triplet Translation View */}
                {viewMode === 'translation' && (
                  <div className="space-y-1">
                    {/* Codon triplets row */}
                    <div className="flex items-center">
                      <span className="w-12 text-slate-400 font-mono select-none shrink-0 text-right pr-3">
                        DNA
                      </span>
                      <div className="flex flex-wrap gap-x-3 tracking-widest">
                        {renderCodonTriplets(
                          row.dnaChunk,
                          row.startIdx,
                          motifMatchIndices,
                          selectedMotifPos,
                          setHoveredPos,
                          onSelectPosition
                        )}
                      </div>
                    </div>

                    {/* Amino Acid aligned row */}
                    <div className="flex items-center">
                      <span className="w-12 text-sky-600 dark:text-sky-400 font-mono select-none shrink-0 text-right pr-3 font-semibold">
                        A.A.
                      </span>
                      <div className="flex flex-wrap gap-x-3 tracking-widest">
                        {renderAminoAcidRow(row.dnaChunk, row.startIdx)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Helper: render grouped bases
function renderGroupedBases(
  chunk: string,
  chunkGlobalStart: number,
  groupMode: GroupMode,
  motifMap: Map<number, { match: MotifMatch; isStart: boolean }>,
  selectedMotifPos: number | null | undefined,
  setHoveredPos: (pos: number | null) => void,
  onSelectPosition?: (pos: number) => void,
  isComplement = false
) {
  const groupSize = groupMode === '10bp' ? 10 : groupMode === 'codon' ? 3 : chunk.length;
  const groups: string[] = [];

  for (let i = 0; i < chunk.length; i += groupSize) {
    groups.push(chunk.substring(i, Math.min(chunk.length, i + groupSize)));
  }

  let baseOffset = 0;

  return groups.map((grp, gIdx) => {
    const grpStart = baseOffset;
    baseOffset += grp.length;

    return (
      <span key={gIdx} className="inline-block whitespace-nowrap">
        {grp.split('').map((char, cIdx) => {
          const globalIdx = chunkGlobalStart + grpStart + cIdx;
          const pos1Based = globalIdx + 1;
          const motifInfo = motifMap.get(globalIdx);
          const isSelected = selectedMotifPos === pos1Based;

          let colorClass = '';
          switch (char) {
            case 'A':
              colorClass = 'text-emerald-700 dark:text-emerald-400';
              break;
            case 'T':
            case 'U':
              colorClass = 'text-rose-700 dark:text-rose-400';
              break;
            case 'G':
              colorClass = 'text-amber-700 dark:text-amber-400';
              break;
            case 'C':
              colorClass = 'text-sky-700 dark:text-sky-400';
              break;
            default:
              colorClass = 'text-slate-500';
          }

          return (
            <span
              key={cIdx}
              onMouseEnter={() => setHoveredPos(pos1Based)}
              onMouseLeave={() => setHoveredPos(null)}
              onClick={() => onSelectPosition && onSelectPosition(pos1Based)}
              className={`cursor-pointer transition-colors px-[1px] py-[1px] rounded-xs font-bold ${colorClass} ${
                motifInfo
                  ? isSelected
                    ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-500 font-extrabold'
                    : 'bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200'
                  : 'hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
              title={`Base ${char} at position ${pos1Based}${motifInfo ? ` (Motif: ${motifInfo.match.match})` : ''}`}
            >
              {char}
            </span>
          );
        })}
      </span>
    );
  });
}

// Helper: render hydrogen bonding lines
function renderHydrogenBonds(chunk: string, groupMode: GroupMode) {
  const groupSize = groupMode === '10bp' ? 10 : groupMode === 'codon' ? 3 : chunk.length;
  const groups: string[] = [];
  for (let i = 0; i < chunk.length; i += groupSize) {
    groups.push(chunk.substring(i, Math.min(chunk.length, i + groupSize)));
  }

  return groups.map((grp, gIdx) => (
    <span key={gIdx} className="inline-block whitespace-nowrap">
      {grp.split('').map((char, cIdx) => {
        // A-T has 2 hydrogen bonds (:), G-C has 3 hydrogen bonds (⋮ or :)
        const bondSymbol = char === 'G' || char === 'C' ? '⋮' : ':';
        return (
          <span key={cIdx} className="inline-block text-center w-[12px] opacity-60">
            {bondSymbol}
          </span>
        );
      })}
    </span>
  ));
}

// Helper: render codon triplets
function renderCodonTriplets(
  chunk: string,
  chunkGlobalStart: number,
  motifMap: Map<number, { match: MotifMatch; isStart: boolean }>,
  selectedMotifPos: number | null | undefined,
  setHoveredPos: (pos: number | null) => void,
  onSelectPosition?: (pos: number) => void
) {
  const triplets: string[] = [];
  for (let i = 0; i < chunk.length; i += 3) {
    triplets.push(chunk.substring(i, Math.min(chunk.length, i + 3)));
  }

  let offset = 0;
  return triplets.map((trip, idx) => {
    const tripStart = offset;
    offset += trip.length;

    return (
      <span
        key={idx}
        className="inline-flex gap-x-[1px] p-0.5 rounded-sm bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800"
      >
        {trip.split('').map((char, cIdx) => {
          const globalIdx = chunkGlobalStart + tripStart + cIdx;
          const pos1Based = globalIdx + 1;
          const motifInfo = motifMap.get(globalIdx);

          let colorClass = '';
          switch (char) {
            case 'A':
              colorClass = 'text-emerald-700 dark:text-emerald-400';
              break;
            case 'T':
              colorClass = 'text-rose-700 dark:text-rose-400';
              break;
            case 'G':
              colorClass = 'text-amber-700 dark:text-amber-400';
              break;
            case 'C':
              colorClass = 'text-sky-700 dark:text-sky-400';
              break;
            default:
              colorClass = 'text-slate-500';
          }

          return (
            <span
              key={cIdx}
              onMouseEnter={() => setHoveredPos(pos1Based)}
              onMouseLeave={() => setHoveredPos(null)}
              onClick={() => onSelectPosition && onSelectPosition(pos1Based)}
              className={`font-mono font-bold cursor-pointer px-[2px] ${colorClass} ${
                motifInfo ? 'bg-amber-300 dark:bg-amber-800 text-amber-950 dark:text-amber-100' : ''
              }`}
            >
              {char}
            </span>
          );
        })}
      </span>
    );
  });
}

// Helper: render amino acid aligned under codon triplets
function renderAminoAcidRow(chunk: string, chunkGlobalStart: number) {
  const triplets: string[] = [];
  for (let i = 0; i < chunk.length; i += 3) {
    triplets.push(chunk.substring(i, Math.min(chunk.length, i + 3)));
  }

  return triplets.map((trip, idx) => {
    if (trip.length < 3) {
      return (
        <span
          key={idx}
          className="inline-flex justify-center items-center w-[36px] text-[10px] text-slate-400"
        >
          -
        </span>
      );
    }

    const aa = CODON_TABLE[trip] || '?';
    const isStop = aa === '*';
    const isStart = trip === 'ATG';

    return (
      <span
        key={idx}
        className={`inline-flex justify-center items-center w-[36px] text-xs font-bold font-mono px-1 py-0.5 rounded-sm ${
          isStop
            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
            : isStart
            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
            : 'bg-slate-200/50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200'
        }`}
        title={`Codon ${trip} -> Amino acid ${aa} (${isStart ? 'Start' : isStop ? 'Stop' : ''})`}
      >
        {aa}
      </span>
    );
  });
}
