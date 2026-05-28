'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    BookOpenIcon,
    ClipboardDocumentIcon,
    DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { Publication } from '@/types/publication';
import { useMessages } from '@/lib/i18n/useMessages';
import { cn } from '@/lib/utils';

interface SelectedPublicationsProps {
    publications: Publication[];
    title?: string;
    enableOnePageMode?: boolean;
}

export default function SelectedPublications({ publications, title, enableOnePageMode = false }: SelectedPublicationsProps) {
    const messages = useMessages();
    const resolvedTitle = title || messages.home.selectedPublications;
    const [expandedBibtexId, setExpandedBibtexId] = useState<string | null>(null);
    const [expandedAbstractId, setExpandedAbstractId] = useState<string | null>(null);

    return (
        <section>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-serif font-bold text-primary">{resolvedTitle}</h2>
                <Link
                    href={enableOnePageMode ? "/#publications" : "/publications"}
                    prefetch={true}
                    className="text-accent hover:text-accent-dark text-sm font-medium transition-all duration-200 rounded hover:bg-accent/10 hover:shadow-sm"
                >
                    {messages.home.viewAll} →
                </Link>
            </div>
            <div className="space-y-4">
                {publications.map((pub) => (
                    <div
                        key={pub.id}
                        className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg shadow-sm border border-neutral-200 dark:border-[rgba(148,163,184,0.24)] hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                    >
                        <h3 className="font-semibold text-primary mb-2 leading-tight">
                            {pub.venue_tag && (
                                <span className="text-accent mr-2 border border-accent/30 bg-accent/5 px-2 py-0.5 rounded text-sm whitespace-nowrap">
                                    {pub.venue_tag}
                                </span>
                            )}
                            {pub.paper || pub.preprint || pub.url || pub.doi ? (
                                <a href={pub.paper || pub.preprint || pub.url || `https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                                    {pub.title}
                                </a>
                            ) : (
                                pub.title
                            )}
                        </h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-500 mb-1">
                            {pub.authors.map((author, idx) => (
                                <span key={idx}>
                                    <span className={`${author.isHighlighted ? 'font-semibold text-accent' : ''} ${author.isCoAuthor ? `underline underline-offset-4 ${author.isHighlighted ? 'decoration-accent' : 'decoration-neutral-400'}` : ''}`}>
                                        {author.name}
                                    </span>
                                    {author.isCorresponding && (
                                        <sup className={`ml-0 ${author.isHighlighted ? 'text-accent' : 'text-neutral-600 dark:text-neutral-500'}`}>†</sup>
                                    )}
                                    {idx < pub.authors.length - 1 && ', '}
                                </span>
                            ))}
                        </p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-500 mb-2">
                            {pub.journal || pub.conference} {pub.acceptanceRate && <span className="font-normal italic">(Acceptance Rate: {pub.acceptanceRate})</span>}
                        </p>
                        {pub.description && (
                            <p className="text-sm text-neutral-500 dark:text-neutral-500 line-clamp-2 mb-2">
                                {pub.description}
                            </p>
                        )}

                        <div className="flex flex-wrap gap-2 mt-2">
                            {pub.preprint && (
                                <a href={pub.preprint} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-white transition-colors">
                                    Preprint
                                </a>
                            )}
                            {pub.paper && (
                                <a href={pub.paper} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-white transition-colors">
                                    Paper
                                </a>
                            )}
                            {pub.pdfUrl && !pub.paper && (
                                <a href={pub.pdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-white transition-colors">
                                    PDF
                                </a>
                            )}
                            {pub.url && !pub.pdfUrl && !pub.paper && (
                                <a href={pub.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-white transition-colors">
                                    Link
                                </a>
                            )}
                            {pub.project && (
                                <a href={pub.project} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-white transition-colors">
                                    Project Page
                                </a>
                            )}
                            {pub.code && (
                                <a href={pub.code} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-white transition-colors">
                                    Code / Github
                                </a>
                            )}
                            {pub.dataset && (
                                <a href={pub.dataset} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-white transition-colors">
                                    Dataset
                                </a>
                            )}
                            {pub.video && (
                                <a href={pub.video} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-white transition-colors">
                                    Video
                                </a>
                            )}
                            {pub.slides && (
                                <a href={pub.slides} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-white transition-colors">
                                    Slides
                                </a>
                            )}
                            {pub.blogs && pub.blogs.map((blog, idx) => (
                                <a key={`blog-${idx}`} href={blog.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-white transition-colors">
                                    {blog.name}
                                </a>
                            ))}
                            {pub.media && (
                                <a href={pub.media} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-white transition-colors">
                                    Media
                                </a>
                            )}
                            {pub.abstract && (
                                <button
                                    onClick={() => setExpandedAbstractId(expandedAbstractId === pub.id ? null : pub.id)}
                                    className={cn(
                                        "inline-flex items-center px-3 py-1 rounded-md text-xs font-medium transition-colors",
                                        expandedAbstractId === pub.id
                                            ? "bg-accent text-white"
                                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-white"
                                    )}
                                >
                                    <DocumentTextIcon className="h-3 w-3 mr-1.5" />
                                    {messages.publications.abstract}
                                </button>
                            )}
                            {pub.bibtex && (
                                <button
                                    onClick={() => setExpandedBibtexId(expandedBibtexId === pub.id ? null : pub.id)}
                                    className={cn(
                                        "inline-flex items-center px-3 py-1 rounded-md text-xs font-medium transition-colors",
                                        expandedBibtexId === pub.id
                                            ? "bg-accent text-white"
                                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-white"
                                    )}
                                >
                                    <BookOpenIcon className="h-3 w-3 mr-1.5" />
                                    {messages.publications.bibtex}
                                </button>
                            )}
                        </div>

                        <AnimatePresence>
                            {expandedAbstractId === pub.id && pub.abstract ? (
                                <motion.div
                                    key="abstract"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden mt-4"
                                >
                                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
                                        <p className="text-sm text-neutral-600 dark:text-neutral-500 leading-relaxed">
                                            {pub.abstract}
                                        </p>
                                    </div>
                                </motion.div>
                            ) : null}
                            {expandedBibtexId === pub.id && pub.bibtex ? (
                                <motion.div
                                    key="bibtex"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden mt-4"
                                >
                                    <div className="relative bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
                                        <pre className="text-xs text-neutral-600 dark:text-neutral-500 overflow-x-auto whitespace-pre-wrap font-mono">
                                            {pub.bibtex}
                                        </pre>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(pub.bibtex || '');
                                            }}
                                            className="absolute top-2 right-2 p-1.5 rounded-md bg-white dark:bg-neutral-700 text-neutral-500 hover:text-accent shadow-sm border border-neutral-200 dark:border-neutral-600 transition-colors"
                                            title={messages.common.copyToClipboard}
                                        >
                                            <ClipboardDocumentIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ) : null}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </section>
    );
}
