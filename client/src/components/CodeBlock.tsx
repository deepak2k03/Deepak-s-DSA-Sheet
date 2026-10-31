import React, { useState, useMemo } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language: string;
  className?: string;
}

// Token types for syntax highlighting
type TokenType =
  | 'keyword'
  | 'type'
  | 'string'
  | 'comment'
  | 'number'
  | 'function'
  | 'operator'
  | 'plain';

interface Token {
  type: TokenType;
  text: string;
}

const KEYWORDS = new Set([
  // Common
  'class', 'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do',
  'switch', 'case', 'break', 'continue', 'default', 'new', 'delete', 'typeof', 'instanceof',
  'try', 'catch', 'finally', 'throw', 'yield', 'async', 'await', 'import', 'export', 'from',
  'as', 'this', 'super', 'extends', 'implements', 'interface', 'package', 'public', 'private',
  'protected', 'static', 'final', 'abstract', 'synchronized', 'volatile', 'transient', 'native',
  // C++ / Java types & keywords
  'int', 'long', 'float', 'double', 'char', 'bool', 'boolean', 'byte', 'short', 'void', 'auto',
  'signed', 'unsigned', 'size_t', 'nullptr', 'null', 'true', 'false', 'struct', 'union', 'enum',
  'namespace', 'using', 'template', 'typename', 'typedef', 'inline', 'virtual', 'override',
  // Python
  'def', 'elif', 'pass', 'lambda', 'with', 'in', 'is', 'not', 'and', 'or', 'None', 'True',
  'False', 'self', 'global', 'nonlocal', 'assert', 'raise', 'except',
]);

const BUILTIN_TYPES = new Set([
  'TreeNode', 'ListNode', 'Node', 'Solution', 'vector', 'Vector', 'string', 'String',
  'unordered_map', 'unordered_set', 'map', 'set', 'queue', 'stack', 'priority_queue',
  'pair', 'tuple', 'deque', 'list', 'ArrayList', 'LinkedList', 'HashMap', 'HashSet',
  'TreeMap', 'TreeSet', 'PriorityQueue', 'Collections', 'Arrays', 'Math', 'Integer',
  'Double', 'Boolean', 'Character', 'Object', 'Array', 'Set', 'Map', 'Promise',
]);

function tokenizeLine(line: string, inMultiLineComment: boolean): { tokens: Token[]; stillInMultiLineComment: boolean } {
  const tokens: Token[] = [];
  let i = 0;
  let inMLC = inMultiLineComment;

  while (i < line.length) {
    // If inside a multi-line comment from previous line
    if (inMLC) {
      const endIdx = line.indexOf('*/', i);
      if (endIdx === -1) {
        tokens.push({ type: 'comment', text: line.slice(i) });
        return { tokens, stillInMultiLineComment: true };
      } else {
        tokens.push({ type: 'comment', text: line.slice(i, endIdx + 2) });
        i = endIdx + 2;
        inMLC = false;
        continue;
      }
    }

    // Check single-line comment //
    if (line[i] === '/' && line[i + 1] === '/') {
      tokens.push({ type: 'comment', text: line.slice(i) });
      break;
    }

    // Check single-line comment # (Python)
    if (line[i] === '#') {
      tokens.push({ type: 'comment', text: line.slice(i) });
      break;
    }

    // Check multi-line comment /*
    if (line[i] === '/' && line[i + 1] === '*') {
      const endIdx = line.indexOf('*/', i + 2);
      if (endIdx === -1) {
        tokens.push({ type: 'comment', text: line.slice(i) });
        return { tokens, stillInMultiLineComment: true };
      } else {
        tokens.push({ type: 'comment', text: line.slice(i, endIdx + 2) });
        i = endIdx + 2;
        continue;
      }
    }

    // Check strings "..." or '...' or `...`
    if (line[i] === '"' || line[i] === "'" || line[i] === '`') {
      const quote = line[i];
      let str = quote;
      i++;
      let escaped = false;
      while (i < line.length) {
        const ch = line[i];
        str += ch;
        if (ch === '\\' && !escaped) {
          escaped = true;
        } else if (ch === quote && !escaped) {
          i++;
          break;
        } else {
          escaped = false;
        }
        i++;
      }
      tokens.push({ type: 'string', text: str });
      continue;
    }

    // Check numbers
    if (/\d/.test(line[i]) && (i === 0 || !/[a-zA-Z_]/.test(line[i - 1]))) {
      let num = '';
      while (i < line.length && /[\w.]/.test(line[i])) {
        num += line[i];
        i++;
      }
      tokens.push({ type: 'number', text: num });
      continue;
    }

    // Check identifiers & keywords
    if (/[a-zA-Z_]/.test(line[i])) {
      let word = '';
      while (i < line.length && /[a-zA-Z0-9_]/.test(line[i])) {
        word += line[i];
        i++;
      }

      // Peek if followed by '(' (ignoring whitespace) -> function
      let isFunc = false;
      let peek = i;
      while (peek < line.length && line[peek] === ' ') peek++;
      if (peek < line.length && line[peek] === '(') {
        isFunc = true;
      }

      if (KEYWORDS.has(word)) {
        tokens.push({ type: 'keyword', text: word });
      } else if (BUILTIN_TYPES.has(word) || /^[A-Z][a-zA-Z0-9_]+$/.test(word)) {
        tokens.push({ type: 'type', text: word });
      } else if (isFunc) {
        tokens.push({ type: 'function', text: word });
      } else {
        tokens.push({ type: 'plain', text: word });
      }
      continue;
    }

    // Check operators & punctuation
    if (/[+\-*/%=<>!&|^~?:;,.{}()[\]]/.test(line[i])) {
      tokens.push({ type: 'operator', text: line[i] });
      i++;
      continue;
    }

    // Whitespace or unknown
    tokens.push({ type: 'plain', text: line[i] });
    i++;
  }

  return { tokens, stillInMultiLineComment: inMLC };
}

const tokenStyle: Record<TokenType, string> = {
  keyword: 'text-[#ff7b72] font-semibold',       // Coral/Red
  type: 'text-[#79c0ff]',                         // Light Blue
  string: 'text-[#a5d6ff]',                       // Sky Blue
  comment: 'text-[#8b949e] italic',               // Muted Slate Gray
  number: 'text-[#d2a8ff]',                       // Purple
  function: 'text-[#d2a8ff] font-medium',         // Lavender
  operator: 'text-[#ff7b72]',                     // Coral
  plain: 'text-[#e6edf3]',                        // Bright White/Gray
};

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language, className = '' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const lines = useMemo(() => {
    const rawLines = (code || '').trimEnd().split(/\r?\n/);
    const parsed: Token[][] = [];
    let inMultiLine = false;

    for (const line of rawLines) {
      const { tokens, stillInMultiLineComment } = tokenizeLine(line, inMultiLine);
      parsed.push(tokens);
      inMultiLine = stillInMultiLineComment;
    }

    return parsed;
  }, [code]);

  return (
    <div className={`group relative rounded-2xl overflow-hidden border border-slate-800 bg-[#0d1117] shadow-xl ${className}`}>
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800/80 bg-[#161b22] px-4 py-2.5 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
          </div>
          <span className="ml-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {language}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-[#21262d] px-2.5 py-1 text-[11px] font-medium text-slate-300 transition hover:bg-[#30363d] hover:text-white"
          title="Copy to clipboard"
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Area with Line Numbers */}
      <div className="overflow-x-auto p-4 font-mono text-xs sm:text-sm leading-relaxed">
        <table className="border-collapse w-full">
          <tbody>
            {lines.map((tokens, idx) => (
              <tr key={idx} className="hover:bg-slate-800/20">
                <td className="w-10 select-none pr-4 text-right font-mono text-[11px] text-slate-600 dark:text-slate-600">
                  {idx + 1}
                </td>
                <td className="whitespace-pre">
                  {tokens.map((tok, tIdx) => (
                    <span key={tIdx} className={tokenStyle[tok.type]}>
                      {tok.text}
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default CodeBlock;

