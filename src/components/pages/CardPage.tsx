'use client';

import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { CardPageConfig } from '@/types/page';

const markdownComponents = {
    p: ({ children }: React.ComponentProps<'p'>) => <p className="mb-3 last:mb-0">{children}</p>,
    ul: ({ children }: React.ComponentProps<'ul'>) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
    ol: ({ children }: React.ComponentProps<'ol'>) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
    li: ({ children }: React.ComponentProps<'li'>) => <li className="mb-1">{children}</li>,
    a: ({ title, ...props }: React.ComponentProps<'a'>) => {
        if (title === 'author') {
            return (
                <a
                    {...props}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline transition-all duration-200"
                />
            );
        }
        return (
            <a
                {...props}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent font-medium transition-all duration-200 rounded hover:bg-accent/10 hover:shadow-sm"
            />
        );
    },
    blockquote: ({ children }: React.ComponentProps<'blockquote'>) => (
        <blockquote className="border-l-4 border-accent/50 pl-4 italic my-4 text-neutral-600 dark:text-neutral-500">
            {children}
        </blockquote>
    ),
    strong: ({ children }: React.ComponentProps<'strong'>) => <strong className="font-semibold text-primary">{children}</strong>,
    em: ({ children }: React.ComponentProps<'em'>) => <em className="italic">{children}</em>,
    code: ({ children }: React.ComponentProps<'code'>) => (
        <code className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[0.95em]">{children}</code>
    ),
};

function CardItem({ item, embedded, layout }: { item: CardPageConfig['items'][0]; embedded: boolean; layout?: string }) {
    if (layout === 'compact') {
        return (
            <div className="flex items-start space-x-3 py-3 border-b border-neutral-100 dark:border-neutral-800 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors px-3 rounded-lg">
                <span className="text-sm font-medium text-neutral-500 mt-0.5 w-20 flex-shrink-0">{item.date}</span>
                <div className="flex-grow">
                    {item.title && <h3 className="font-semibold text-primary mb-1">{item.title}</h3>}
                    <div className="text-sm text-neutral-700 dark:text-neutral-300">
                        <ReactMarkdown components={markdownComponents}>
                            {item.content || ""}
                        </ReactMarkdown>
                    </div>
                </div>
            </div>
        );
    }

    const CardWrapper = item.link ? 'a' : 'div';
    const wrapperProps = item.link ? { href: item.link, target: "_blank", rel: "noopener noreferrer" } as Record<string, string> : {};

    return (
        <CardWrapper
            {...wrapperProps}
            className={`block bg-white dark:bg-neutral-900 ${embedded ? "p-4" : "p-6"} rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${item.link ? 'cursor-pointer group' : 'hover:scale-[1.01]'}`}
        >
            <div className={`flex flex-col sm:flex-row gap-4 ${layout === 'double' ? 'sm:gap-4' : 'sm:gap-6'}`}>
                {item.image && (
                    <div className={`self-start flex-shrink-0 w-32 ${layout === 'double' ? 'sm:w-24' : 'sm:w-40'} rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-sm mx-auto sm:mx-0`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.image} alt={item.title} className="w-full h-auto object-cover" />
                    </div>
                )}
                {item.avatar && (
                    <div className={`self-start flex-shrink-0 w-24 h-24 ${layout === 'double' ? 'sm:w-20 sm:h-20' : 'sm:w-32 sm:h-32'} rounded-full overflow-hidden border-2 border-neutral-100 dark:border-neutral-800 shadow-sm mx-auto sm:mx-0`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.avatar} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                )}
                <div className="flex-grow">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className={`${embedded ? "text-lg" : "text-xl"} font-semibold text-primary ${item.link ? 'group-hover:text-accent transition-colors' : ''}`}>
                            {item.title}
                        </h3>
                        {item.date && (
                            <span className="text-sm text-neutral-500 font-medium bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded whitespace-nowrap ml-2">
                                {item.date}
                            </span>
                        )}
                    </div>
                    {item.subtitle && (
                        <p className={`${embedded ? "text-sm" : "text-base"} text-accent font-medium mb-3`}>{item.subtitle}</p>
                    )}
                    {item.content && (
                        <div className={`${embedded ? "text-sm" : "text-base"} text-neutral-600 dark:text-neutral-500 leading-relaxed`}>
                            <ReactMarkdown components={markdownComponents}>
                                {item.content}
                            </ReactMarkdown>
                        </div>
                    )}
                    {item.tags && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            {item.tags.map(tag => (
                                <span key={tag} className="text-xs text-neutral-500 bg-neutral-50 dark:bg-neutral-800/50 px-2 py-1 rounded border border-neutral-100 dark:border-neutral-800">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </CardWrapper>
    );
}

export default function CardPage({ config, embedded = false }: { config: CardPageConfig; embedded?: boolean }) {
    // Check if items have 'group' field for grouped rendering
    const hasGroups = config.items.some(item => item.group);

    // Build groups
    const groupedItems: Record<string, typeof config.items> = {};
    const ungroupedItems: typeof config.items = [];

    if (hasGroups) {
        for (const item of config.items) {
            if (item.group) {
                if (!groupedItems[item.group]) groupedItems[item.group] = [];
                groupedItems[item.group].push(item);
            } else {
                ungroupedItems.push(item);
            }
        }
    }

    // Group metadata from config (if available)
    const groupMeta = config.groups;

    return (
        <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0 }}
        >
            <div className={embedded ? "mb-4" : "mb-8"}>
                <h1 className={`${embedded ? "text-2xl" : "text-4xl"} font-serif font-bold text-primary mb-4`}>{config.title}</h1>
                {config.description && (
                    <div className={`${embedded ? "text-base" : "text-lg"} text-neutral-600 dark:text-neutral-500 max-w-2xl leading-relaxed`}>
                        <ReactMarkdown components={markdownComponents}>
                            {config.description}
                        </ReactMarkdown>
                    </div>
                )}
            </div>

            {hasGroups ? (
                <>
                    {Object.entries(groupedItems).map(([groupKey, items]) => (
                        <div key={groupKey} className="mb-10">
                            <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-6 border-b pb-2 border-neutral-200 dark:border-neutral-800">
                                {groupMeta?.[groupKey]?.title || groupKey}
                            </h2>
                            <div className={`grid ${config.layout === 'double' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} ${embedded ? "gap-4" : "gap-6"}`}>
                                {items.map((item, index) => (
                                    <CardItem key={index} item={item} embedded={embedded} layout={config.layout} />
                                ))}
                            </div>
                        </div>
                    ))}
                    {ungroupedItems.length > 0 && (
                        <div className={`grid ${config.layout === 'double' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} ${embedded ? "gap-4" : "gap-6"}`}>
                            {ungroupedItems.map((item, index) => (
                                <CardItem key={index} item={item} embedded={embedded} layout={config.layout} />
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div className={`grid ${config.layout === 'double' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} ${embedded ? "gap-4" : "gap-6"}`}>
                    {config.items.map((item, index) => (
                        <CardItem key={index} item={item} embedded={embedded} layout={config.layout} />
                    ))}
                </div>
            )}
        </motion.div>
    );
}
