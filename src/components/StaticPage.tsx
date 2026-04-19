import React from "react";
import ReactMarkdown from "react-markdown";
import { Helmet } from "react-helmet-async";
import STYLE from "../utils/config";

interface Props {
  content: string;
  title: string;
  description?: string;
}

const mdComponents: React.ComponentProps<typeof ReactMarkdown>["components"] = {
  h1: ({ children }) => (
    <h1
      className={`${STYLE.pageTitle()} text-primary-green italic mt-10 mb-4 first:mt-0`}
    >
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-serif text-xl text-primary-green mt-8 mb-3 border-b border-border-color pb-1">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-serif text-lg text-deep-charcoal mt-6 mb-2 font-semibold">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="font-serif text-deep-charcoal leading-relaxed mb-4">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-outside ml-5 mb-4 space-y-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-outside ml-5 mb-4 space-y-1">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="font-serif text-deep-charcoal leading-relaxed">
      {children}
    </li>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      className="text-primary-green underline underline-offset-2 hover:opacity-70 transition-opacity"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-deep-charcoal">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-deep-charcoal">{children}</em>
  ),
  hr: () => <hr className="border-border-color my-8" />,
  code: ({ children }) => (
    <code className="font-mono text-sm bg-card-bg text-primary-green px-1.5 py-0.5 rounded">
      {children}
    </code>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-primary-green pl-4 my-4 text-deep-charcoal opacity-80">
      {children}
    </blockquote>
  ),
};

export const StaticPage: React.FC<Props> = ({
  content,
  title,
  description,
}) => (
  <div className="min-h-screen px-4 lg:px-6 pb-8 lg:pb-12 pt-6 bg-main-bg">
    <Helmet>
      <title>{title} | Wiener Grünflächen Index</title>
      {description && <meta name="description" content={description} />}
    </Helmet>
    <div className="max-w-3xl ">
      <ReactMarkdown components={mdComponents}>{content}</ReactMarkdown>
    </div>
  </div>
);

export default StaticPage;
