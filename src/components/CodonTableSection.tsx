import React, { useState, useMemo } from 'react';
import { AMINO_ACID_DETAILS, CODON_TABLE } from '../utils/dnaAnalyzer';
import { Search, Info, Check, Filter } from 'lucide-react';

export const CodonTableSection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedCodon, setSelectedCodon] = useState<string>('ATG');

  // Build list of all 64 codons
  const allCodons = useMemo(() => {
    return Object.entries(CODON_TABLE).map(([dnaCodon, aaCode]) => {
      const rnaCodon = dnaCodon.replace(/T/g, 'U');
      const info = AMINO_ACID_DETAILS[aaCode];
      return {
        dnaCodon,
        rnaCodon,
        aaCode,
        info,
      };
    });
  }, []);

  // Filtered codons
  const filteredCodons = useMemo(() => {
    return allCodons.filter((item) => {
      const q = searchQuery.trim().toUpperCase();
      const matchesSearch =
        !q ||
        item.dnaCodon.includes(q) ||
        item.rnaCodon.includes(q) ||
        item.aaCode.toUpperCase() === q ||
        item.info?.name.toUpperCase().includes(q) ||
        item.info?.code3.toUpperCase().includes(q);

      const matchesCat =
        categoryFilter === 'all' || item.info?.category === categoryFilter;

      return matchesSearch && matchesCat;
    });
  }, [allCodons, searchQuery, categoryFilter]);

  const activeCodonDetails = useMemo(() => {
    const dna = selectedCodon.toUpperCase();
    const aa = CODON_TABLE[dna] || '?';
    const rna = dna.replace(/T/g, 'U');
    const info = AMINO_ACID_DETAILS[aa];

    // Find all synonymous codons for this amino acid
    const synonymous = Object.entries(CODON_TABLE)
      .filter(([_, code]) => code === aa)
      .map(([c]) => c);

    return {
      dna,
      rna,
      aa,
      info,
      synonymous,
    };
  }, [selectedCodon]);

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Standard Universal Genetic Code Reference
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive 64-codon table mapping DNA triplets and mRNA codons to standard amino acids
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by codon (ATG), amino acid (Met / M), or name (Leucine)..."
              className="w-full pl-9 pr-4 py-2 font-mono text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>

          {/* Category Select Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
            {['all', 'hydrophobic', 'polar', 'basic', 'acidic', 'stop'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-md capitalize font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Split layout: Codon Grid + Detailed Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Codon Cards Grid (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
            <span>Showing {filteredCodons.length} of 64 codons</span>
            <span>Click any codon to inspect</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-2 max-h-[500px] overflow-y-auto p-1">
            {filteredCodons.map((item) => {
              const isSelected = selectedCodon === item.dnaCodon;
              const isStop = item.aaCode === '*';
              const isStart = item.dnaCodon === 'ATG';

              return (
                <button
                  key={item.dnaCodon}
                  onClick={() => setSelectedCodon(item.dnaCodon)}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/60 ring-2 ring-sky-500/40'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                      {item.dnaCodon}
                    </span>
                    <span
                      className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded-sm ${
                        isStop
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : isStart
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-200/60 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {item.aaCode}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-mono text-rose-600 dark:text-rose-400">
                      {item.rnaCodon}
                    </span>
                    <span className="truncate max-w-[80px]">
                      {item.info?.code3 || '-'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Codon & Amino Acid Inspector Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Info className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Residue Inspector
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            {/* Codon Pair Display */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                Codon Specification
              </span>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                    {activeCodonDetails.dna}
                  </span>
                  <span className="text-xs text-slate-400 ml-1 font-mono">(DNA)</span>
                </div>
                <div>
                  <span className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400">
                    {activeCodonDetails.rna}
                  </span>
                  <span className="text-xs text-slate-400 ml-1 font-mono">(mRNA)</span>
                </div>
              </div>
            </div>

            {/* Amino Acid Identity */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Target Amino Acid
              </span>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-mono font-bold text-xl flex items-center justify-center border border-sky-200 dark:border-sky-800">
                  {activeCodonDetails.aa}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {activeCodonDetails.info?.name}
                  </h4>
                  <p className="text-slate-500 font-mono text-xs">
                    3-Letter: {activeCodonDetails.info?.code3} · 1-Letter: {activeCodonDetails.aa}
                  </p>
                </div>
              </div>
            </div>

            {/* Properties */}
            {activeCodonDetails.info && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-500">Chemical Category:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                    {activeCodonDetails.info.category}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Molecular Mass:</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {activeCodonDetails.info.weight} g/mol (Da)
                  </span>
                </div>
                <div className="pt-1">
                  <span className="text-slate-500 block mb-1">Biological Role:</span>
                  <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                    {activeCodonDetails.info.description}
                  </p>
                </div>
              </div>
            )}

            {/* Synonymous Codons (Degeneracy) */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Synonymous Codons ({activeCodonDetails.synonymous.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeCodonDetails.synonymous.map((syn) => (
                  <button
                    key={syn}
                    onClick={() => setSelectedCodon(syn)}
                    className={`px-2 py-0.5 rounded-sm font-mono text-xs transition-colors cursor-pointer ${
                      syn === activeCodonDetails.dna
                        ? 'bg-sky-600 text-white font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {syn}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
