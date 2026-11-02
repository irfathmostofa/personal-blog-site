import type { CSSProperties, ReactNode } from "react";

import { SafeImage } from "@/components/content/safe-image";

import {
  asTiptapDoc,
  headingIdFor,
  nodeText,
  type TiptapMark,
  type TiptapNode,
} from "@/lib/article/tiptap";
import type { Json } from "@/lib/types/database";
import { cn } from "@/lib/utils";

function attrString(attrs: Record<string, unknown> | undefined, key: string) {
  const value = attrs?.[key];
  return typeof value === "string" ? value : null;
}

function attrNumber(attrs: Record<string, unknown> | undefined, key: string) {
  const value = attrs?.[key];
  return typeof value === "number" ? value : null;
}

function wrapMarks(text: string, marks: TiptapMark[] | undefined, key: string): ReactNode {
  let node: ReactNode = text;
  const ordered = [...(marks ?? [])].reverse();

  for (const mark of ordered) {
    if (mark.type === "bold") {
      node = <strong key={`${key}-b`}>{node}</strong>;
    } else if (mark.type === "italic") {
      node = <em key={`${key}-i`}>{node}</em>;
    } else if (mark.type === "underline") {
      node = <u key={`${key}-u`}>{node}</u>;
    } else if (mark.type === "strike") {
      node = <s key={`${key}-s`}>{node}</s>;
    } else if (mark.type === "code") {
      node = <code key={`${key}-c`}>{node}</code>;
    } else if (mark.type === "link") {
      const href = attrString(mark.attrs, "href") ?? "#";
      const target = attrString(mark.attrs, "target") ?? undefined;
      node = (
        <a
          key={`${key}-a`}
          href={href}
          target={target}
          rel={target === "_blank" ? "noreferrer noopener" : undefined}
        >
          {node}
        </a>
      );
    }
  }

  return node;
}

function renderInline(nodes: TiptapNode[] | undefined, prefix: string): ReactNode[] {
  return (nodes ?? []).map((node, index) => {
    const key = `${prefix}-${index}`;
    if (node.type === "text") {
      return (
        <span key={key}>{wrapMarks(node.text ?? "", node.marks, key)}</span>
      );
    }
    if (node.type === "hardBreak") {
      return <br key={key} />;
    }
    return <span key={key}>{renderNode(node, key)}</span>;
  });
}

function imageAlignClass(align: string | null) {
  if (align === "left") return "ml-0 mr-auto";
  if (align === "right") return "ml-auto mr-0";
  return "mx-auto";
}

function renderNode(node: TiptapNode, key: string, headingIds?: Map<string, number>): ReactNode {
  switch (node.type) {
    case "paragraph":
      return <p key={key}>{renderInline(node.content, key)}</p>;
    case "heading": {
      const level = Number(node.attrs?.level ?? 2);
      const Tag = (level === 3 ? "h3" : level === 4 ? "h4" : "h2") as "h2" | "h3" | "h4";
      const id =
        headingIds && (level === 2 || level === 3)
          ? headingIdFor(node, headingIds)
          : undefined;
      return (
        <Tag key={key} id={id}>
          {renderInline(node.content, key)}
        </Tag>
      );
    }
    case "blockquote":
      return <blockquote key={key}>{node.content?.map((child, i) => renderNode(child, `${key}-${i}`, headingIds))}</blockquote>;
    case "bulletList":
      return (
        <ul key={key}>
          {node.content?.map((child, i) => renderNode(child, `${key}-${i}`, headingIds))}
        </ul>
      );
    case "orderedList":
      return (
        <ol key={key}>
          {node.content?.map((child, i) => renderNode(child, `${key}-${i}`, headingIds))}
        </ol>
      );
    case "listItem":
      return (
        <li key={key}>
          {node.content?.map((child, i) => renderNode(child, `${key}-${i}`, headingIds))}
        </li>
      );
    case "codeBlock": {
      const language = attrString(node.attrs, "language");
      return (
        <pre key={key} data-language={language ?? undefined}>
          <code>{nodeText(node)}</code>
        </pre>
      );
    }
    case "horizontalRule":
      return <hr key={key} />;
    case "image": {
      const src = attrString(node.attrs, "src");
      if (!src) return null;
      const alt = attrString(node.attrs, "alt") ?? "";
      const title = attrString(node.attrs, "title");
      const caption = attrString(node.attrs, "caption") ?? title;
      const width = attrNumber(node.attrs, "width") ?? 1200;
      const height = attrNumber(node.attrs, "height") ?? 675;
      const align = attrString(node.attrs, "align");
      const figureStyle: CSSProperties | undefined = width
        ? { maxWidth: Math.min(width, 720) }
        : undefined;
      return (
        <figure key={key} className={cn(imageAlignClass(align))} style={figureStyle}>
          <SafeImage
            src={src}
            alt={alt}
            width={width}
            height={height}
            className="h-auto w-full"
            sizes="(min-width: 768px) 42rem, 100vw"
          />
          {caption ? <figcaption>{caption}</figcaption> : null}
        </figure>
      );
    }
    case "table":
      return (
        <div key={key} className="overflow-x-auto">
          <table>
            <tbody>
              {node.content?.map((child, i) => renderNode(child, `${key}-${i}`, headingIds))}
            </tbody>
          </table>
        </div>
      );
    case "tableRow":
      return (
        <tr key={key}>
          {node.content?.map((child, i) => renderNode(child, `${key}-${i}`, headingIds))}
        </tr>
      );
    case "tableHeader":
      return (
        <th key={key}>{renderInline(node.content, key)}</th>
      );
    case "tableCell":
      return (
        <td key={key}>{renderInline(node.content, key)}</td>
      );
    default:
      if (node.content?.length) {
        return (
          <div key={key}>
            {node.content.map((child, i) => renderNode(child, `${key}-${i}`, headingIds))}
          </div>
        );
      }
      return null;
  }
}

export function ArticleBody({ content }: { content: Json }) {
  const doc = asTiptapDoc(content);
  const headingIds = new Map<string, number>();
  const children = (doc.content ?? []).map((node, index) =>
    renderNode(node, `n-${index}`, headingIds),
  );

  if (children.filter(Boolean).length === 0) {
    return (
      <p className="text-muted-foreground italic">This article has no body yet.</p>
    );
  }

  return <div className="article-prose">{children}</div>;
}
