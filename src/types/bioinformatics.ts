export interface FastaRecord {
  id: string;
  header: string;
  rawHeader: string;
  sequence: string;
  description: string;
  valid: boolean;
  invalidCharacters: Array<{ char: string; index: number }>;
}

export interface BaseCounts {
  A: number;
  T: number;
  G: number;
  C: number;
  other: number;
  total: number;
}

export interface MotifMatch {
  index: number; // 0-based
  position: number; // 1-based (standard bioinformatics convention)
  match: string;
  strand: '+' | '-';
  contextBefore: string;
  contextAfter: string;
}

export interface ReadingFrame {
  frame: number; // +1, +2, +3, -1, -2, -3
  label: string;
  direction: '+' | '-';
  dnaSeq: string;
  rnaSeq: string;
  protein: string;
  orfs: OpenReadingFrame[];
}

export interface OpenReadingFrame {
  startCodonPos: number; // 1-based in original sequence
  stopCodonPos: number; // 1-based in original sequence
  lengthCodons: number;
  lengthBases: number;
  protein: string;
  hasStop: boolean;
}

export interface AminoAcidInfo {
  code1: string;
  code3: string;
  name: string;
  category: 'hydrophobic' | 'polar' | 'basic' | 'acidic' | 'special' | 'stop';
  description: string;
  weight: number; // g/mol
}

export interface PresetSequence {
  id: string;
  title: string;
  organism: string;
  category: string;
  description: string;
  fastaContent: string;
}
