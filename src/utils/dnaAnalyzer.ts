import {
  FastaRecord,
  BaseCounts,
  MotifMatch,
  ReadingFrame,
  OpenReadingFrame,
  AminoAcidInfo,
  PresetSequence,
} from '../types/bioinformatics';

// Standard genetic code bases & amino acid map faithfully matching the user's Python script
export const BASES = 'TCAG';
export const AMINO_ACIDS =
  'FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG';

export const CODON_TABLE: Record<string, string> = {};
let idx = 0;
for (const first of BASES) {
  for (const second of BASES) {
    for (const third of BASES) {
      CODON_TABLE[first + second + third] = AMINO_ACIDS[idx];
      idx += 1;
    }
  }
}

// RNA Codon table (U instead of T)
export const RNA_CODON_TABLE: Record<string, string> = {};
for (const [dnaCodon, aa] of Object.entries(CODON_TABLE)) {
  RNA_CODON_TABLE[dnaCodon.replace(/T/g, 'U')] = aa;
}

export const AMINO_ACID_DETAILS: Record<string, AminoAcidInfo> = {
  A: { code1: 'A', code3: 'Ala', name: 'Alanine', category: 'hydrophobic', description: 'Non-polar, aliphatic side chain', weight: 89.09 },
  R: { code1: 'R', code3: 'Arg', name: 'Arginine', category: 'basic', description: 'Positively charged, strongly basic guanidinium group', weight: 174.20 },
  N: { code1: 'N', code3: 'Asn', name: 'Asparagine', category: 'polar', description: 'Polar, uncharged carboxamide side chain', weight: 132.12 },
  D: { code1: 'D', code3: 'Asp', name: 'Aspartic Acid', category: 'acidic', description: 'Negatively charged, acidic carboxylate', weight: 133.10 },
  C: { code1: 'C', code3: 'Cys', name: 'Cysteine', category: 'special', description: 'Thiol group capable of forming disulfide bridges', weight: 121.16 },
  E: { code1: 'E', code3: 'Glu', name: 'Glutamic Acid', category: 'acidic', description: 'Negatively charged, key in metabolic signaling', weight: 147.13 },
  Q: { code1: 'Q', code3: 'Gln', name: 'Glutamine', category: 'polar', description: 'Polar, abundant in blood plasma and protein folding', weight: 146.15 },
  G: { code1: 'G', code3: 'Gly', name: 'Glycine', category: 'special', description: 'Smallest amino acid, highly flexible backbone', weight: 75.07 },
  H: { code1: 'H', code3: 'His', name: 'Histidine', category: 'basic', description: 'Imidazole ring, essential in enzyme active sites', weight: 155.16 },
  I: { code1: 'I', code3: 'Ile', name: 'Isoleucine', category: 'hydrophobic', description: 'Branched-chain hydrophobic residue', weight: 131.18 },
  L: { code1: 'L', code3: 'Leu', name: 'Leucine', category: 'hydrophobic', description: 'Most abundant amino acid in globular proteins', weight: 131.18 },
  K: { code1: 'K', code3: 'Lys', name: 'Lysine', category: 'basic', description: 'Positively charged primary amine, target for post-translational modification', weight: 146.19 },
  M: { code1: 'M', code3: 'Met', name: 'Methionine', category: 'hydrophobic', description: 'Start codon (AUG) product, sulfur-containing non-polar', weight: 149.21 },
  F: { code1: 'F', code3: 'Phe', name: 'Phenylalanine', category: 'hydrophobic', description: 'Aromatic, highly hydrophobic benzyl side chain', weight: 165.19 },
  P: { code1: 'P', code3: 'Pro', name: 'Proline', category: 'special', description: 'Cyclic imino acid, introduces rigid kinks into alpha-helices', weight: 115.13 },
  S: { code1: 'S', code3: 'Ser', name: 'Serine', category: 'polar', description: 'Hydroxyl-bearing polar residue, phosphorylation site', weight: 105.09 },
  T: { code1: 'T', code3: 'Thr', name: 'Threonine', category: 'polar', description: 'Secondary alcohol polar residue, phosphorylation site', weight: 119.12 },
  W: { code1: 'W', code3: 'Trp', name: 'Tryptophan', category: 'hydrophobic', description: 'Bulky aromatic indole ring, absorbs UV at 280 nm', weight: 204.23 },
  Y: { code1: 'Y', code3: 'Tyr', name: 'Tyrosine', category: 'polar', description: 'Phenolic hydroxyl group, phosphorylation and enzyme active site', weight: 181.19 },
  V: { code1: 'V', code3: 'Val', name: 'Valine', category: 'hydrophobic', description: 'Branched-chain aliphatic hydrocarbon', weight: 117.15 },
  '*': { code1: '*', code3: 'Stop', name: 'Stop Codon', category: 'stop', description: 'Translation termination (TAA Ochre, TAG Amber, TGA Opal)', weight: 0 },
};

/**
 * Parses raw text containing one or multiple FASTA formatted records.
 * If raw text does not have '>' header, treats it as a single unnamed record.
 */
export function parseFasta(rawContent: string): FastaRecord[] {
  if (!rawContent || !rawContent.trim()) {
    return [];
  }

  const lines = rawContent.split(/\r?\n/);
  const records: FastaRecord[] = [];
  let currentHeader = '';
  let currentSeqLines: string[] = [];
  let recordCounter = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('>')) {
      if (currentHeader !== '' || currentSeqLines.length > 0) {
        records.push(createRecord(currentHeader, currentSeqLines.join(''), recordCounter++));
        currentSeqLines = [];
      }
      currentHeader = line.substring(1).trim();
    } else if (line) {
      currentSeqLines.push(line);
    }
  }

  if (currentHeader !== '' || currentSeqLines.length > 0) {
    records.push(createRecord(currentHeader, currentSeqLines.join(''), recordCounter));
  }

  return records;
}

function createRecord(rawHeader: string, rawSequence: string, fallbackIndex: number): FastaRecord {
  // Extract ID and description from header if available
  // e.g. ">sp|P01308|INS_HUMAN Insulin [Homo sapiens]" -> id="sp|P01308|INS_HUMAN", desc="Insulin [Homo sapiens]"
  let id = `Seq_${fallbackIndex}`;
  let description = '';

  if (rawHeader) {
    const firstSpaceIndex = rawHeader.search(/\s/);
    if (firstSpaceIndex !== -1) {
      id = rawHeader.substring(0, firstSpaceIndex).trim();
      description = rawHeader.substring(firstSpaceIndex).trim();
    } else {
      id = rawHeader.trim();
    }
  }

  // Sanitize sequence
  const { clean, invalidChars } = cleanSequence(rawSequence);

  return {
    id,
    header: id + (description ? ` ${description}` : ''),
    rawHeader: rawHeader || id,
    sequence: clean,
    description,
    valid: invalidChars.length === 0,
    invalidCharacters: invalidChars,
  };
}

/**
 * Clean sequence: remove whitespace/numbers, uppercase, check for valid bases (A, T, G, C)
 * Faithful to Python logic:
 * seq = "".join(seq.split()).upper()
 */
export function cleanSequence(seq: string): { clean: string; invalidChars: Array<{ char: string; index: number }> } {
  const noWhitespace = seq.replace(/[\s\d\r\n\t]/g, '').toUpperCase();
  const invalidChars: Array<{ char: string; index: number }> = [];

  for (let i = 0; i < noWhitespace.length; i++) {
    const char = noWhitespace[i];
    if (!'ATGC'.includes(char)) {
      invalidChars.push({ char, index: i });
    }
  }

  return {
    clean: noWhitespace,
    invalidChars,
  };
}

/**
 * Remove any non-ATGC bases to make the sequence 100% valid
 */
export function sanitizeToCanonical(seq: string): string {
  return seq.replace(/[^ATGC]/gi, '').toUpperCase();
}

/**
 * Count bases { A, T, G, C, other, total }
 */
export function countBases(seq: string): BaseCounts {
  const counts: BaseCounts = { A: 0, T: 0, G: 0, C: 0, other: 0, total: seq.length };
  for (let i = 0; i < seq.length; i++) {
    const base = seq[i];
    if (base === 'A') counts.A++;
    else if (base === 'T') counts.T++;
    else if (base === 'G') counts.G++;
    else if (base === 'C') counts.C++;
    else counts.other++;
  }
  return counts;
}

/**
 * Calculate GC content as percentage (0 - 100)
 */
export function gcContent(seq: string): number {
  if (!seq || seq.length === 0) return 0;
  let gc = 0;
  for (let i = 0; i < seq.length; i++) {
    const b = seq[i];
    if (b === 'G' || b === 'C') gc++;
  }
  return (gc / seq.length) * 100;
}

/**
 * Return complementary strand without reversal: A->T, T->A, G->C, C->G
 */
export function complementStrand(seq: string): string {
  const pairs: Record<string, string> = { A: 'T', T: 'A', G: 'C', C: 'G', U: 'A' };
  let res = '';
  for (let i = 0; i < seq.length; i++) {
    const b = seq[i];
    res += pairs[b] || 'N';
  }
  return res;
}

/**
 * Reverse complement strand: complement reversed 5'->3'
 */
export function reverseComplement(seq: string): string {
  return complementStrand(seq).split('').reverse().join('');
}

/**
 * Transcribe DNA coding strand to mRNA (T becomes U)
 */
export function transcribe(seq: string): string {
  return seq.replace(/T/g, 'U');
}

/**
 * Translate DNA into a protein sequence.
 * If stopAtFirstStop is true, stops translation when hitting first STOP codon (*).
 */
export function translate(seq: string, stopAtFirstStop = true): string {
  let protein = '';
  for (let i = 0; i <= seq.length - 3; i += 3) {
    const codon = seq.substring(i, i + 3);
    const aa = CODON_TABLE[codon] || '?';
    if (stopAtFirstStop && aa === '*') {
      break;
    }
    protein += aa;
  }
  return protein;
}

/**
 * 6-Frame translation: +1, +2, +3 forward frames, and -1, -2, -3 reverse complement frames.
 */
export function calculateSixFrames(seq: string): ReadingFrame[] {
  const frames: ReadingFrame[] = [];
  const revComp = reverseComplement(seq);

  // Forward frames +1, +2, +3
  for (let offset = 0; offset < 3; offset++) {
    const frameNumber = offset + 1;
    const subDna = seq.substring(offset);
    const protein = translate(subDna, false);
    const orfs = findOrfsInFrame(subDna, offset, '+', seq.length);
    frames.push({
      frame: frameNumber,
      label: `Frame +${frameNumber} (5'→3')`,
      direction: '+',
      dnaSeq: subDna,
      rnaSeq: transcribe(subDna),
      protein,
      orfs,
    });
  }

  // Reverse frames -1, -2, -3
  for (let offset = 0; offset < 3; offset++) {
    const frameNumber = offset + 1;
    const subDna = revComp.substring(offset);
    const protein = translate(subDna, false);
    const orfs = findOrfsInFrame(subDna, offset, '-', seq.length);
    frames.push({
      frame: -frameNumber,
      label: `Frame -${frameNumber} (3'←5')`,
      direction: '-',
      dnaSeq: subDna,
      rnaSeq: transcribe(subDna),
      protein,
      orfs,
    });
  }

  return frames;
}

function findOrfsInFrame(frameDna: string, frameOffset: number, direction: '+' | '-', originalSeqLength: number): OpenReadingFrame[] {
  const orfs: OpenReadingFrame[] = [];
  let inOrf = false;
  let currentStartCodonIdx = -1;
  let currentAa = '';

  for (let i = 0; i <= frameDna.length - 3; i += 3) {
    const codon = frameDna.substring(i, i + 3);
    const aa = CODON_TABLE[codon] || '?';

    if (!inOrf && codon === 'ATG') {
      inOrf = true;
      currentStartCodonIdx = i;
      currentAa = 'M';
    } else if (inOrf) {
      if (aa === '*') {
        const lengthCodons = currentAa.length;
        const lengthBases = (i + 3) - currentStartCodonIdx;
        const startPos = direction === '+' 
          ? frameOffset + currentStartCodonIdx + 1 
          : originalSeqLength - (frameOffset + currentStartCodonIdx);
        const stopPos = direction === '+'
          ? frameOffset + i + 3
          : originalSeqLength - (frameOffset + i + 2);

        orfs.push({
          startCodonPos: startPos,
          stopCodonPos: stopPos,
          lengthCodons,
          lengthBases,
          protein: currentAa,
          hasStop: true,
        });

        inOrf = false;
        currentStartCodonIdx = -1;
        currentAa = '';
      } else {
        currentAa += aa;
      }
    }
  }

  // Handle open reading frame that runs to the end without a stop codon
  if (inOrf && currentAa.length >= 5) {
    const lengthCodons = currentAa.length;
    const lengthBases = frameDna.length - currentStartCodonIdx;
    const startPos = direction === '+' 
      ? frameOffset + currentStartCodonIdx + 1 
      : originalSeqLength - (frameOffset + currentStartCodonIdx);

    orfs.push({
      startCodonPos: startPos,
      stopCodonPos: direction === '+' ? originalSeqLength : 1,
      lengthCodons,
      lengthBases,
      protein: currentAa,
      hasStop: false,
    });
  }

  return orfs.sort((a, b) => b.lengthCodons - a.lengthCodons);
}

/**
 * Searches for a motif (1-based start positions) in the sequence.
 * Matches find_motif(seq, motif) from the user's Python script.
 * Also supports IUPAC degenerate codes (N = any, R = A/G, Y = C/T, etc.) and reverse strand option.
 */
export function findMotif(
  seq: string,
  rawMotif: string,
  searchReverse = false
): MotifMatch[] {
  if (!seq || !rawMotif) return [];
  const motif = rawMotif.trim().toUpperCase();
  if (motif.length === 0) return [];

  const matches: MotifMatch[] = [];

  // Convert motif to regex for IUPAC degenerate base code support
  const iupacMap: Record<string, string> = {
    A: 'A',
    T: 'T',
    G: 'G',
    C: 'C',
    U: '[TU]',
    R: '[AG]',
    Y: '[CT]',
    S: '[GC]',
    W: '[AT]',
    K: '[GT]',
    M: '[AC]',
    B: '[CGT]',
    D: '[AGT]',
    H: '[ACT]',
    V: '[ACG]',
    N: '[ACGT]',
  };

  const regexPatternStr = motif
    .split('')
    .map((char) => iupacMap[char] || char)
    .join('');

  // 1. Forward strand search
  try {
    const regex = new RegExp(`(?=(${regexPatternStr}))`, 'gi');
    let match;
    while ((match = regex.exec(seq)) !== null) {
      const idx = match.index;
      const matchedText = seq.substring(idx, idx + motif.length);
      const startPos = idx + 1; // 1-based index (matching Python output)
      
      const contextStart = Math.max(0, idx - 10);
      const contextEnd = Math.min(seq.length, idx + motif.length + 10);
      
      matches.push({
        index: idx,
        position: startPos,
        match: matchedText,
        strand: '+',
        contextBefore: seq.substring(contextStart, idx),
        contextAfter: seq.substring(idx + motif.length, contextEnd),
      });

      // Avoid infinite loops with zero-length matches
      regex.lastIndex = idx + 1;
    }
  } catch {
    // Fallback exact match
    for (let i = 0; i <= seq.length - motif.length; i++) {
      if (seq.substring(i, i + motif.length) === motif) {
        matches.push({
          index: i,
          position: i + 1,
          match: motif,
          strand: '+',
          contextBefore: seq.substring(Math.max(0, i - 10), i),
          contextAfter: seq.substring(i + motif.length, Math.min(seq.length, i + motif.length + 10)),
        });
      }
    }
  }

  // 2. Reverse strand search if requested
  if (searchReverse) {
    const revCompMotif = reverseComplement(motif);
    if (revCompMotif !== motif) {
      const revMatches = findMotif(seq, revCompMotif, false);
      for (const rm of revMatches) {
        matches.push({
          ...rm,
          strand: '-',
        });
      }
    }
  }

  return matches.sort((a, b) => a.position - b.position);
}

/**
 * Melting temperature (Tm) calculation in Celsius
 * Wallace Rule for < 14 bp: Tm = 2*(A+T) + 4*(G+C)
 * Standard Marmur-Doty formula for >= 14 bp: Tm = 64.9 + 41 * (GC - 16.4) / length
 */
export function calculateMeltingTemperature(seq: string): number {
  if (!seq || seq.length === 0) return 0;
  const counts = countBases(seq);
  const at = counts.A + counts.T;
  const gc = counts.G + counts.C;
  const len = at + gc;
  if (len === 0) return 0;

  if (len < 14) {
    return 2 * at + 4 * gc;
  }
  return 64.9 + (41 * (gc - 16.4)) / len;
}

/**
 * Molecular Weight estimation in Daltons / g/mol
 * ssDNA average nucleotide MW ~ 330 Da
 * dsDNA average base pair MW ~ 650 Da
 */
export function calculateMolecularWeight(seq: string, type: 'ssDNA' | 'dsDNA' = 'ssDNA'): number {
  if (!seq) return 0;
  // Specific base molecular weights (monophosphate):
  // dAMP: 313.21 g/mol
  // dTMP: 304.20 g/mol
  // dGMP: 329.21 g/mol
  // dCMP: 289.18 g/mol
  const counts = countBases(seq);
  const singleStrand =
    counts.A * 313.21 +
    counts.T * 304.2 +
    counts.G * 329.21 +
    counts.C * 289.18 -
    61.96; // water loss for phosphodiester backbones

  if (type === 'dsDNA') {
    // Complementary strand weight
    const compWeight =
      counts.T * 313.21 +
      counts.A * 304.2 +
      counts.C * 329.21 +
      counts.G * 289.18 -
      61.96;
    return Math.max(0, singleStrand + compWeight);
  }

  return Math.max(0, singleStrand);
}

/**
 * Format records back to standard FASTA string with wrapping (default 60 chars per line)
 */
export function formatFasta(records: Array<{ header: string; sequence: string }>, lineWidth = 60): string {
  return records
    .map((rec) => {
      const headerLine = rec.header.startsWith('>') ? rec.header : `>${rec.header}`;
      const wrappedSeq = wrapSequence(rec.sequence, lineWidth);
      return `${headerLine}\n${wrappedSeq}`;
    })
    .join('\n\n');
}

export function wrapSequence(seq: string, lineWidth = 60): string {
  const chunks: string[] = [];
  for (let i = 0; i < seq.length; i += lineWidth) {
    chunks.push(seq.substring(i, i + lineWidth));
  }
  return chunks.join('\n');
}

/**
 * Curated biotechnology preset sequences
 */
export const PRESET_SEQUENCES: PresetSequence[] = [
  {
    id: 'gfp',
    title: 'GFP Chromophore (Aequorea victoria)',
    organism: 'Aequorea victoria (Jellyfish)',
    category: 'Fluorescent Reporter',
    description: 'Coding sequence of the green fluorescent protein containing the Ser65-Tyr66-Gly67 chromophore tripeptide motif.',
    fastaContent: `>GFP_Aequorea_victoria Green Fluorescent Protein (partial coding sequence)
ATGAGTAAAGGAGAAGAACTTTTCACTGGAGTTGTCCCAATTCTTGTTGAATTAGATGGT
GATGTTAATGGGCACAAATTTTCTGTCAGTGGAGAGGGTGAAGGTGATGCAACATACGGA
AAACTTACCCTTAAATTTATTTGCACTACTGGAAAACTACCTGTTCCATGGCCAACACTT
GTCACTACTTTCTCTTATGGTGTTCAATGCTTTTCCCGTTATCCGGATCATATGAAACGG
CATGACTTTTTCAAGAGTGCCATGCCCGAAGGTTATGTACAGGAACGCACTATATCTTTC
AAAGATGACGGGAACTACAAGACGCGTGCTGAAGTCAAGTTTGAAGGTGATACCCTTGTT
AATCGTATCGAGTTAAAAGGTATTGATTTTAAAGAAGATGGAAACATTCTCGGACACAAA
CTCGAGTACAACTATAACTCACACAATGTATACATCACGGCAGACAAACAAAAGAATGGA
ATCAAAGCTAACTTCAAAATTCGCCACAACATTGAAGATGGATCCGTTCAACTAGCAGAC
CATTATCAACAAAATACTCCAATTGGCGATGGCCCTGTCCTTTTACCAGACAACCATTAC
CTGTCGACACAATCTGCCCTTTCGAAAGATCCCAACGAAAAGCGTGACCACATGGTCCTT
CTTGAGTTTGTAACTGCTGCTGGGATTACACATGGCATGGATGAACTCTACAAATAA`,
  },
  {
    id: 'insulin',
    title: 'Human Preproinsulin (INS CDS)',
    organism: 'Homo sapiens',
    category: 'Therapeutic Protein',
    description: 'Complete coding sequence for human preproinsulin (Signal peptide, B-chain, C-peptide, A-chain). Used in recombinant DNA insulin production.',
    fastaContent: `>sp|P01308|INS_HUMAN Insulin [Homo sapiens] (CDS)
ATGGCCCTGTGGATGCGCCTCCTGCCCCTGCTGGCGCTGCTGGCCCTCTGGGGACCTGAC
CCAGCCGCAGCCTTTGTGAACCAACACCTGTGCGGCTCACACCTGGTGGAAGCTCTCTAC
CTAGTGTGCGGGGAACGAGGCTTCTTCTACACACCCAAGACCCGCCGGGAGGCAGAGGAC
CTGCAGGTGGGGCAGGTGGAGCTGGGCGGCGGCCCTGGTGCAGGCAGCCTGCAGCCCTTG
GCCCTGGAGGGGTCCCTGCAGAAGCGTGGCATTGTGGAACAATGCTGTACCAGCATCTGC
TCCCTCTACCAGCTGGAGAACTACTGCAACTAG`,
  },
  {
    id: 'puc19_mcs',
    title: 'pUC19 Multiple Cloning Site (MCS)',
    organism: 'Cloning Vector',
    category: 'Molecular Cloning',
    description: 'Synthetic polylinker region containing tandem recognition sites for EcoRI, SmaI, BamHI, SalI, PstI, SphI, HindIII inside the lacZ alpha gene.',
    fastaContent: `>pUC19_MCS Multiple Cloning Site (Polylinker) with flanking lacZ sequence
ATGACCATGATTACGCCAAGCTTGCATGCCTGCAGGTCGACTCTAGAGGATCCCCGGGTA
CCGAGCTCGAATTCACTGGCCGTCGTTTTACAACGTCGTGACTGGGAAAACCCTGGCGTT
ACCCAACTTAATCGCCTTGCAGCACATCCCCCTTTCGCCAGC`,
  },
  {
    id: 'hbb_normal_vs_sickle',
    title: 'Human Beta-Globin (Normal HbA)',
    organism: 'Homo sapiens',
    category: 'Genetic Medicine',
    description: 'Wild-type exon 1 segment of the beta-globin (HBB) gene. Position 18-20 contains GAG (Glutamic Acid). In Sickle Cell (HbS), this mutates to GTG (Valine).',
    fastaContent: `>HBB_Normal_Exon1 Human hemoglobin subunit beta (wild-type HbA)
ATGGTGCATCTGACTCCTGAGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAGGTGAAC
GTGGATGAAGTTGGTGGTGAGGCCCTGGGCAGGCTGCTGGTGGTCTACCCTTGGACCCAG
AGGTTCTTTGAGTCCTTTGGGGATCTGTCCACTCCTGATGCTGTTATGGGCAACCCTAAG
GTGAAGGCTCATGGCAAGAAAGTGCTCGGTGCCTTTAGTGATGGCCTGGCTCACCTGGAC
AACCTCAAGGGCACCTTTGCCACACTGAGTGAGCTGCACTGTGACAAGCTGCACGTGGAT
CCTGAGAACTTCAGGCTCCTGGGCAACGTGCTGGTCTGTGTGCTGGCCCATCACTTTGGC
AAAGAATTCACCCCACCAGTGCAGGCTGCCTATCAGAAAGTGGTGGCTGGTGTGGCTAAT
GCCCTGGCCCACAAGTATCACTAA`,
  },
  {
    id: 'hbb_sickle',
    title: 'Human Beta-Globin (Sickle Cell HbS Mutation)',
    organism: 'Homo sapiens',
    category: 'Genetic Medicine',
    description: 'Point mutation in codon 6: GAG -> GTG. Translates to Val instead of Glu, causing hemoglobin polymerisation and sickle-shaped erythrocytes.',
    fastaContent: `>HBB_Sickle_Cell_Exon1 Human hemoglobin subunit beta (HbS pathogenic variant)
ATGGTGCATCTGACTCCTGTGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAGGTGAAC
GTGGATGAAGTTGGTGGTGAGGCCCTGGGCAGGCTGCTGGTGGTCTACCCTTGGACCCAG
AGGTTCTTTGAGTCCTTTGGGGATCTGTCCACTCCTGATGCTGTTATGGGCAACCCTAAG
GTGAAGGCTCATGGCAAGAAAGTGCTCGGTGCCTTTAGTGATGGCCTGGCTCACCTGGAC
AACCTCAAGGGCACCTTTGCCACACTGAGTGAGCTGCACTGTGACAAGCTGCACGTGGAT
CCTGAGAACTTCAGGCTCCTGGGCAACGTGCTGGTCTGTGTGCTGGCCCATCACTTTGGC
AAAGAATTCACCCCACCAGTGCAGGCTGCCTATCAGAAAGTGGTGGCTGGTGTGGCTAAT
GCCCTGGCCCACAAGTATCACTAA`,
  },
  {
    id: 'ecoli_tata',
    title: 'Bacterial Promoter & Shine-Dalgarno',
    organism: 'Escherichia coli',
    category: 'Gene Regulation',
    description: 'Model promoter featuring the -35 consensus (TTGACA), Pribnow box / TATA box (-10 TATAAT), transcription start (+1), and ribosome binding site (AGGAGG).',
    fastaContent: `>E_coli_Promoter_RBS Typical prokaryotic promoter and ribosome binding site
TTGACATTTATGCTTCCGGCTCGTATAATGTGTGGAATTGTGAGCGGATAACAATTTCAC
ACAGGAGGAACAGACCATGGAATTCGAGCTCGGTACCCGGGGATCCTCTAGAGTCGACCT
GCAGGCATGCAAGCTTGGCTGTTTTGGCGGATGAGAGAAGATTTTCAGCCTGATACAGAT
TAA`,
  },
];

/**
 * Common biotechnology sequence motifs
 */
export const BIOTECH_MOTIF_PRESETS = [
  { name: 'Start Codon', motif: 'ATG', type: 'Translation', desc: 'Methionine initiator codon' },
  { name: 'TATA Box', motif: 'TATAAA', type: 'Promoter', desc: 'Eukaryotic core promoter binding TBP' },
  { name: 'EcoRI Site', motif: 'GAATTC', type: 'Restriction', desc: "Restriction enzyme cutting at G^AATTC" },
  { name: 'BamHI Site', motif: 'GGATCC', type: 'Restriction', desc: "Restriction enzyme cutting at G^GATCC" },
  { name: 'HindIII Site', motif: 'AAGCTT', type: 'Restriction', desc: "Restriction enzyme cutting at A^AGCTT" },
  { name: 'PstI Site', motif: 'CTGCAG', type: 'Restriction', desc: "Restriction enzyme cutting at CTGCA^G" },
  { name: 'Shine-Dalgarno', motif: 'AGGAGG', type: 'Ribosome', desc: 'Prokaryotic ribosome binding site (RBS)' },
  { name: 'Poly(A) Signal', motif: 'AATAAA', type: 'mRNA Processing', desc: 'Cleavage and polyadenylation signal' },
  { name: 'SpCas9 PAM', motif: 'NGG', type: 'CRISPR', desc: 'Streptococcus pyogenes Cas9 PAM motif' },
];

/**
 * Returns the exact annotated Python code from the student project
 */
export function getPythonSourceCode(): string {
  return `"""DNA Sequence Analyzer
A beginner-friendly Python project for biotechnology students.

What it does:
  1. Cleans and validates a DNA sequence
  2. Counts A, T, G, C and calculates GC content
  3. Finds the reverse complement
  4. Transcribes DNA to mRNA
  5. Translates mRNA to a protein sequence
  6. Searches for a motif (a short pattern) in the sequence

Run it:  python dna_analyzer.py
"""

# Standard genetic code, built from a compact string.
BASES = "TCAG"
AMINO_ACIDS = "FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG"
CODON_TABLE = {}
i = 0
for first in BASES:
    for second in BASES:
        for third in BASES:
            CODON_TABLE[first + second + third] = AMINO_ACIDS[i]
            i += 1


def clean_sequence(seq):
    """Remove spaces/newlines, make uppercase, and check for valid bases."""
    seq = "".join(seq.split()).upper()
    for base in seq:
        if base not in "ATGC":
            raise ValueError("Invalid base found: " + base)
    return seq


def count_bases(seq):
    """Return a dictionary with the count of each base."""
    return {base: seq.count(base) for base in "ATGC"}


def gc_content(seq):
    """Return GC content as a percentage."""
    gc = seq.count("G") + seq.count("C")
    return gc / len(seq) * 100


def reverse_complement(seq):
    """Return the reverse complement strand."""
    pairs = {"A": "T", "T": "A", "G": "C", "C": "G"}
    complement = "".join(pairs[base] for base in seq)
    return complement[::-1]


def transcribe(seq):
    """DNA coding strand to mRNA (T becomes U)."""
    return seq.replace("T", "U")


def translate(seq):
    """Translate DNA into a protein, stopping at the first stop codon."""
    protein = ""
    for i in range(0, len(seq) - 2, 3):
        amino_acid = CODON_TABLE[seq[i:i + 3]]
        if amino_acid == "*":
            break
        protein += amino_acid
    return protein


def find_motif(seq, motif):
    """Return the start positions (1-based) of a motif in the sequence."""
    motif = motif.upper()
    positions = []
    for i in range(len(seq) - len(motif) + 1):
        if seq[i:i + len(motif)] == motif:
            positions.append(i + 1)
    return positions


def main():
    raw = input("Enter a DNA sequence (A, T, G, C): ")
    try:
        seq = clean_sequence(raw)
    except ValueError as error:
        print("Error:", error)
        return

    if len(seq) == 0:
        print("Error: empty sequence")
        return

    print("\\n--- Results ---")
    print("Length:", len(seq), "bases")
    print("Base counts:", count_bases(seq))
    print("GC content: {:.2f}%".format(gc_content(seq)))
    print("Reverse complement:", reverse_complement(seq))
    print("mRNA:", transcribe(seq))
    print("Protein:", translate(seq))

    motif = input("\\nEnter a motif to search for (e.g. ATG): ")
    if motif:
        found = find_motif(seq, motif)
        if found:
            print("Motif found at positions:", found)
        else:
            print("Motif not found.")


if __name__ == "__main__":
    main()
`;
}
