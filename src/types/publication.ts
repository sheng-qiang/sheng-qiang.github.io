export interface Author {
  name: string;
  isMainAuthor?: boolean;
  affiliation?: string;
  email?: string;
  orcid?: string;
  isHighlighted?: boolean;
  isCorresponding?: boolean;
  isCoAuthor?: boolean;
  url?: string;
}

export interface Publication {
  id: string;
  title: string;
  authors: Author[];
  abstract?: string;
  journal?: string;
  conference?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  year: number;
  month?: string;
  publishedDate?: string;
  doi?: string;
  arxivId?: string;
  pmid?: string;
  url?: string;
  code?: string;
  pdfUrl?: string;
  preprint?: string;
  project?: string;
  video?: string;
  slides?: string;
  dataset?: string;
  paper?: string;
  media?: string;
  blogs?: { name: string; url: string }[];
  venue_tag?: string;
  ccfRank?: 'CCF-A' | 'CCF-B' | 'CCF-C' | 'Others';
  tags: string[];
  keywords?: string[];
  type: PublicationType;
  status: PublicationStatus;
  citations?: number;
  impactFactor?: number;
  quartile?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  bibtex?: string;
  venue?: string;
  acceptanceRate?: string;
  location?: string;
  awards?: string[];
  featured?: boolean;
  selected?: boolean;
  preview?: string;
  summary?: string;
  isOral?: boolean;
  researchArea: ResearchArea;
  description?: string;
}

export type PublicationType =
  | 'journal'
  | 'conference'
  | 'workshop'
  | 'book-chapter'
  | 'book'
  | 'thesis'
  | 'preprint'
  | 'patent'
  | 'technical-report';

export type PublicationStatus =
  | 'published'
  | 'accepted'
  | 'under-review'
  | 'submitted'
  | 'in-preparation'
  | 'draft';

export type ResearchArea =
  | 'ai-healthcare'
  | 'signal-processing'
  | 'reliability-engineering'
  | 'quantum-computing'
  | 'machine-learning'
  | 'fault-diagnosis'
  | 'neural-networks'
  | 'transformer-architectures'
  | 'biomedical-engineering'
  | 'other';

