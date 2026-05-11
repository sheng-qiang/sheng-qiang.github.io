import { Publication, PublicationType, ResearchArea } from '@/types/publication';
import { getConfig } from './config';
import { getRuntimeI18nConfig } from './i18n/config';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const bibtexParse = require('bibtex-parse-js');

// Map BibTeX entry types to our publication types
const typeMapping: Record<string, PublicationType> = {
  article: 'journal',
  inproceedings: 'conference',
  conference: 'conference',
  incollection: 'book-chapter',
  book: 'book',
  phdthesis: 'thesis',
  mastersthesis: 'thesis',
  techreport: 'technical-report',
  unpublished: 'preprint',
  misc: 'preprint',
};

// Convert month names to numbers
const monthMapping: Record<string, number> = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, september: 9, sept: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
};

export function parseBibTeX(bibtexContent: string, locale?: string): Publication[] {
  const highlightNames = getHighlightNames(locale);
  const entries = bibtexParse.toJSON(bibtexContent);

  return entries.map((entry: { entryType: string; citationKey: string; entryTags: Record<string, string> }, index: number) => {
    const tags = entry.entryTags;

    // Parse authors
    const authors = parseAuthors(tags.author || '', highlightNames);

    // Parse year and month
    const year = parseInt(tags.year) || new Date().getFullYear();
    const monthStr = tags.month?.toLowerCase() || '';
    const month = monthMapping[monthStr] || (parseInt(monthStr) || undefined);

    // Determine type
    const type = typeMapping[entry.entryType.toLowerCase()] || 'journal';

    // Parse tags/keywords
    const keywords = tags.keywords?.split(',').map((k: string) => k.trim()) || [];

    // Parse selected field (convert string to boolean)
    const selected = tags.selected === 'true' || tags.selected === 'yes';

    // Parse preview field (remove braces if present)
    const preview = tags.preview?.replace(/[{}]/g, '');

    // Create publication object
    const publication: Publication = {
      id: entry.citationKey || tags.id || `pub-${Date.now()}-${index}`,
      title: cleanBibTeXString(tags.title || 'Untitled'),
      authors,
      year,
      month: monthMapping[tags.month?.toLowerCase()] ? String(month) : tags.month,
      type,
      status: 'published',
      tags: keywords,
      keywords,
      researchArea: detectResearchArea(tags.title, keywords),

      // Optional fields
      journal: cleanBibTeXString(tags.journal),
      conference: cleanBibTeXString(tags.booktitle),
      volume: tags.volume,
      issue: tags.number,
      pages: tags.pages,
      doi: tags.doi,
      pdfUrl: tags.url,
      code: tags.code,
      abstract: cleanBibTeXString(tags.abstract),
      description: cleanBibTeXString(tags.description || tags.note),
      selected,
      preview,
      preprint: tags.preprint,
      project: tags.project,
      video: tags.video,
      slides: tags.slides,
      dataset: tags.dataset,
      paper: tags.paper,
      media: tags.media,
      blogs: tags.blog ? tags.blog.split(',').map((b: string) => {
        const parts = b.split('|');
        if (parts.length === 2) return { name: parts[0].trim(), url: parts[1].trim() };
        return { name: 'Blog', url: parts[0].trim() };
      }) : undefined,
      venue_tag: tags.venue_tag,
      ccfRank: tags.ccf_rank ? `CCF-${tags.ccf_rank.toUpperCase()}` as 'CCF-A' | 'CCF-B' | 'CCF-C' : 'Others',
      acceptanceRate: tags.acceptance_rate,

      // Store BibTeX for user display (excluding custom/internal fields)
      bibtex: reconstructBibTeX(entry, [
        'selected', 'preview', 'description', 'keywords', 'code',
        'venue_tag', 'preprint', 'project', 'video', 'slides',
        'dataset', 'paper', 'media', 'blog', 'note', 'ccf_rank', 'acceptance_rate',
      ]),
    };

    // Clean up undefined fields
    Object.keys(publication).forEach(key => {
      if (publication[key as keyof Publication] === undefined) {
        delete publication[key as keyof Publication];
      }
    });

    return publication;
  }).sort((a: Publication, b: Publication) => {
    // Sort by year (descending), then by month if available
    if (b.year !== a.year) return b.year - a.year;

    // For month comparison, treat missing months as January (1) to ensure they appear last within the year
    const monthA = typeof a.month === 'string' ?
      (monthMapping[a.month.toLowerCase()] || parseInt(a.month) || 1) :
      (a.month || 1);
    const monthB = typeof b.month === 'string' ?
      (monthMapping[b.month.toLowerCase()] || parseInt(b.month) || 1) :
      (b.month || 1);

    // Sort by month descending (December to January)
    return monthB - monthA;
  });
}

function getHighlightNames(locale?: string): string[] {
  const names = new Set<string>();
  const baseConfig = getConfig();
  const runtimeI18n = getRuntimeI18nConfig(baseConfig.i18n);

  const addName = (name?: string) => {
    const cleaned = cleanBibTeXString(name).trim();
    if (cleaned) {
      names.add(cleaned);
    }
  };

  addName(baseConfig.author.name);

  if (runtimeI18n.enabled) {
    runtimeI18n.locales.forEach((localeCode) => {
      const localizedConfig = getConfig(localeCode);
      addName(localizedConfig.author.name);
    });
  }

  if (locale) {
    const currentLocaleConfig = getConfig(locale);
    addName(currentLocaleConfig.author.name);
  }

  return Array.from(names);
}

function normalizePersonNameForMatch(name: string): string {
  return name.toLowerCase().replace(/[\s.,'’`"()\-_/]/g, '');
}

function buildNameVariants(name: string): Set<string> {
  const variants = new Set<string>();
  const cleaned = cleanBibTeXString(name).toLowerCase().trim();

  if (!cleaned) {
    return variants;
  }

  variants.add(cleaned);

  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 2) {
    variants.add(`${parts[1]} ${parts[0]}`);
  }

  return variants;
}

const authorLinks: Record<string, string> = {
  "shaofei wang": "https://scholar.google.com/citations?user=clCHEnkAAAAJ",
  "yuhui shi": "https://scholar.google.com/citations?user=xAw_fukAAAAJ",
  "yehan yang": "http://undground.fun",
  "hao mi": "https://summerrice.github.io/",
  "beizhe hu": "https://beanandrew.github.io/",
  "chaoxi xu": "https://scholar.google.com/citations?user=0z9o2CIAAAAJ",
  "juan cao": "https://scholar.google.com/citations?user=fSBdNg0AAAAJ",
  "zehao li": "https://alphagolzh.github.io/",
  "yang li": "https://liesy.github.io/",
  "zhenlong yuan": "https://zhenlongyuan.github.io/",
  "yujun cai": "https://vanoracai.github.io/",
  "yifan sun": "https://scholar.google.com/citations?user=sv7uxi4AAAAJ",
  "zhengjia wang": "https://zhengjiawa.github.io/",
  "danding wang": "https://scholar.google.com/citations?user=hGZwK0cAAAAJ",
  "xiaoyue mi": "https://scholar.google.com/citations?user=9eDMXxMAAAAJ",
  "fan tang": "https://scholar.google.com/citations?user=PdKElfwAAAAJ",
  "ziyao huang": "https://scholar.google.com/citations?user=nijlf5YAAAAJ",
  "peng li": "https://scholar.google.com/citations?user=hgYzkOQAAAAJ",
  "yang liu": "https://scholar.google.com/citations?user=lVhoKNcAAAAJ",
  "tong-yee lee": "https://scholar.google.com/citations?user=V3PTB98AAAAJ",
  "jiaying wu": "https://jiayingwu19.github.io/",
  "xueyao zhang": "https://www.zhangxueyao.com/",
  "ya wu": "https://scholar.google.com/citations?user=aaz-LdwAAAAJ",
  "guang yang": "https://scholar.google.com/citations?user=DKCzZXsAAAAJ",
  "yuyan bu": "https://scholar.google.com/citations?user=i9SLGsEAAAAJ",
  "sheng liu": "https://scholar.google.com/citations?user=c00aVP0AAAAJ",
  "peng qi": "https://pengqi.website/",
  "siyuan ma": "https://siyuanma.org/",
  "haonan cheng": "https://haonancheng.cn/",
  "jintao li": "http://www.ict.ac.cn/sourcedb/cn/jssrck/200909/t20090917_2496657.html",
  "guojie li": "https://www.ict.ac.cn/sourcedb/cn/jssrck/200909/t20090917_2496654.html",
  "qiong nan": "https://scholar.google.com/citations?user=ZKGK1AIAAAAJ",
  "yongchun zhu": "https://easezyc.github.io/",
  "jiakai wang": "https://jiakaiwangcn.github.io/",
  "renshuai tao": "https://rstao-bjtu.github.io/",
  "xianglong liu": "https://xlliu-beihang.github.io/",
  "zhiwei jin": "https://scholar.google.com/citations?user=iv22mK4AAAAJ",
  "kai shu": "https://www.cs.emory.edu/~kshu5/",
  "minghui wu": "https://scholar.google.com/citations?user=KqSSa-kAAAAJ",
  "jindong wang": "https://jd92.wang/",
  "fuzhen zhuang": "https://fuzhenzhuang.github.io/",
  "h. russell bernard": "https://hrussellbernard.com/",
  "huan liu": "https://www.public.asu.edu/~huanliu/",
  "shuokai li": "https://lisk123.github.io/",
  "rundong li": "https://scholar.google.com/citations?user=PfmGvVQAAAAJ",
  "xirong li": "http://lixirong.net/",
  "lei zhong": "https://scholar.google.com/citations?hl=zh-CN&user=60YtlrIAAAAJ",
  "junbo guo": "https://scholar.google.com/citations?user=4Lzd8P8AAAAJ",
  "ziang wang": "https://scholar.google.com/citations?user=GNG7gk8AAAAJ",
  "tianyun yang": "https://scholar.google.com/citations?user=4u_oHeEAAAAJ",
  "zhaoqi wang": "http://english.ict.cas.cn/people/scien/bln/202303/t20230315_328238.html",
  "baolong bi": "https://byronbbl.github.io/",
  "yilong xu": "https://scholar.google.com/citations?user=6B5N_cQAAAAJ"
};

function parseAuthors(authorsStr: string, highlightNames: string[]): Array<{ name: string; isHighlighted?: boolean; isCorresponding?: boolean; isCoAuthor?: boolean; url?: string }> {
  if (!authorsStr) return [];

  const highlightTextCandidates = new Set<string>();
  const highlightNormalizedCandidates = new Set<string>();

  highlightNames.forEach((name) => {
    const variants = buildNameVariants(name);
    variants.forEach((variant) => {
      highlightTextCandidates.add(variant);
      highlightNormalizedCandidates.add(normalizePersonNameForMatch(variant));
    });
  });

  const highlightTextList = Array.from(highlightTextCandidates);
  const highlightNormalizedList = Array.from(highlightNormalizedCandidates);

  // Split by "and" and clean up
  return authorsStr
    .split(/\sand\s/)
    .map(author => {
      // Clean up the author name
      let name = author.trim();

      // Check for corresponding author marker
      const isCorresponding = name.includes('*');

      // Check for co-author marker (#)
      const isCoAuthor = name.includes('#');

      // Remove special markers from name
      name = name.replace(/[*#]/g, '');

      // Handle "Last, First" format
      if (name.includes(',')) {
        const parts = name.split(',').map(p => p.trim());
        name = `${parts[1]} ${parts[0]}`;
      }

      name = cleanBibTeXString(name);

      // Check if this is the site owner (to highlight)
      const lowerName = name.toLowerCase();
      const normalizedName = normalizePersonNameForMatch(lowerName);
      const isHighlighted =
        highlightTextList.some((candidate) => lowerName.includes(candidate)) ||
        highlightNormalizedList.some((candidate) => normalizedName.includes(candidate));

      const url = authorLinks[lowerName] || undefined;

      return {
        name,
        isHighlighted,
        isCorresponding,
        isCoAuthor,
        url,
      };
    })
    .filter(author => author.name);
}

function cleanBibTeXString(str?: string): string {
  if (!str) return '';

  // Remove outer quotes if present
  let cleaned = str.replace(/^["']|["']$/g, '');

  // Handle nested braces more carefully
  // First remove double braces {{content}} -> content
  cleaned = cleaned.replace(/\{\{([^}]*)\}\}/g, '$1');

  // Remove single braces {content} -> content, but be careful with nesting
  while (cleaned.includes('{') && cleaned.includes('}')) {
    const beforeLength = cleaned.length;
    cleaned = cleaned.replace(/\{([^{}]*)\}/g, '$1');
    // If no change was made, break to avoid infinite loop
    if (cleaned.length === beforeLength) break;
  }

  // Remove any remaining single braces
  cleaned = cleaned.replace(/[{}]/g, '');

  // Handle LaTeX commands (basic)
  cleaned = cleaned.replace(/\\textbf{([^}]*)}/g, '$1');
  cleaned = cleaned.replace(/\\emph{([^}]*)}/g, '$1');
  cleaned = cleaned.replace(/\\cite{[^}]*}/g, '');
  cleaned = cleaned.replace(/~/g, ' ');

  // Remove remaining backslashes
  cleaned = cleaned.replace(/\\/g, '');

  // Remove extra spaces and newlines
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
}

function detectResearchArea(title: string, keywords: string[]): ResearchArea {
  const text = (title + ' ' + keywords.join(' ')).toLowerCase();

  if (text.includes('healthcare') || text.includes('medical') || text.includes('health')) {
    return 'ai-healthcare';
  }
  if (text.includes('signal') || text.includes('processing')) {
    return 'signal-processing';
  }
  if (text.includes('reliability') || text.includes('fault') || text.includes('diagnosis')) {
    return 'reliability-engineering';
  }
  if (text.includes('quantum')) {
    return 'quantum-computing';
  }
  if (text.includes('neural') || text.includes('spiking')) {
    return 'neural-networks';
  }
  if (text.includes('transformer') || text.includes('attention')) {
    return 'transformer-architectures';
  }

  return 'machine-learning';
}

function reconstructBibTeX(entry: { entryType: string; citationKey: string; entryTags: Record<string, string> }, excludeFields: string[] = []): string {
  const { entryType, citationKey, entryTags } = entry;

  let bibtex = `@${entryType}{${citationKey},\n`;

  Object.entries(entryTags).forEach(([key, value]) => {
    // Skip excluded fields
    if (!excludeFields.includes(key.toLowerCase())) {
      let cleanValue = value;

      // Clean author field by removing # and * symbols
      if (key.toLowerCase() === 'author') {
        cleanValue = value.replace(/[#*]/g, '');
      }

      bibtex += `  ${key} = {${cleanValue}},\n`;
    }
  });

  // Remove trailing comma and newline
  bibtex = bibtex.slice(0, -2) + '\n';
  bibtex += '}';

  return bibtex;
} 
