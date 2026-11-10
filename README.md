# DNA Sequence Analyzer

An interactive web app for analysing DNA sequences from FASTA files. It extends my original Python script (`dna_analyzer.py`) into a visual tool for biotechnology and molecular biology work. Built with React and TypeScript using Google AI Studio.

**Live app:** https://ai.studio/apps/0c976061-9171-42c5-87f9-2f86231dbca9

## Features

- **Multi-record FASTA loading:** load one or many sequences and switch between them
- **Sequence validation:** flags invalid characters and can clean a sequence
- **Overview:** summary of the selected sequence with a preview of the first 180 bases
- **Interactive sequence viewer:** inspect individual nucleotides, with motif matches highlighted
- **Transcription and translation:** DNA to mRNA to protein
- **Reverse complement:** view the complementary strand
- **Motif finder:** search for a pattern and jump to each match in the sequence
- **Reading frames and ORFs:** six-frame view for finding open reading frames
- **Genetic code table:** codon reference
- **Export:** download the records you are working with
- **Light and dark mode**

## Original Python script

`dna_analyzer.py` is the command-line version this project started from. It validates a sequence, counts bases, calculates GC content, finds the reverse complement, transcribes and translates, and searches for motifs.

Run it with:

```
python dna_analyzer.py
```

## Run the web app locally

You need [Node.js](https://nodejs.org) installed.

```
npm install
npm run dev
```

Then open the address shown in the terminal. Check `package.json` in this repo if the commands differ.

## Sample FASTA input

```
>sample_sequence
ATGGCCATTGTAATGGGCCGCTGAAAGGGTGCCCGATAG
```

## About

Made by Advita Sai Gade, B.Tech Biotechnology student at PES University, as a project to combine biology with programming. I wrote the original Python script and used Google AI Studio to build the web version.
