"""DNA Sequence Analyzer
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

    print("\n--- Results ---")
    print("Length:", len(seq), "bases")
    print("Base counts:", count_bases(seq))
    print("GC content: {:.2f}%".format(gc_content(seq)))
    print("Reverse complement:", reverse_complement(seq))
    print("mRNA:", transcribe(seq))
    print("Protein:", translate(seq))

    motif = input("\nEnter a motif to search for (e.g. ATG): ")
    if motif:
        found = find_motif(seq, motif)
        if found:
            print("Motif found at positions:", found)
        else:
            print("Motif not found.")


if __name__ == "__main__":
    main()
