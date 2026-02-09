import { Token } from "../token/token";
import { TokenType } from "../token/tokenType";
import { LexerGrammar } from "./lexer.types";
import { keywordsGrammar } from "./grammer/keywords.grammer";
import { operatorsGrammar } from "./grammer/operators.grammer";
import { literalsGrammar } from "./grammer/literals.grammer";
import { commentsGrammar } from "./grammer/comments.grammer";

export class LexerEngine {
    private input: string;
    private tokens: Token[] = [];
    private lines: string[] = [];
    private lineIndex: number = 0;
    private columnIndex: number = 0;
    private indentStack: number[] = [0];

    // Order matters: match keywords/operators before identifiers
    private grammars: LexerGrammar[] = [
        commentsGrammar,
        operatorsGrammar, // Operators before keywords to catch things like "==" vs "=". Wait. Keywords first? "and" vs "android". 
        // Actually Keywords first (word boundary) is safer than Identifiers. 
        // Operators are distinct.
        keywordsGrammar,
        literalsGrammar,
    ];

    constructor (input: string) {
        this.input = input;
    }

    public tokenize(): Token[] {
        this.lines = this.input.split(/\r?\n/);
        this.tokens = [];
        this.indentStack = [0];
        this.lineIndex = 0;

        while (this.lineIndex < this.lines.length) {
            const line = this.lines[this.lineIndex];

            // Ignore empty lines
            if (line.trim().length === 0) {
                this.lineIndex++;
                continue;
            }

            // 1. Handle Indentation (if line is not empty/comment-only)
            if (line.trim().length > 0) {
                const indent = this.measureIndent(line);
                this.handleIndentation(indent);
            }

            // 2. Tokenize line content
            this.tokenizeLine(line);

            this.tokens.push(Token.from(
                "\n",
                TokenType.Newline,
                this.columnIndex,
                this.columnIndex + 1,
                this.lineIndex + 1
            ));

            this.lineIndex++;
        }

        // Dedent at EOF
        while (this.indentStack.length > 1) {
            this.indentStack.pop();
            this.tokens.push(Token.from("", TokenType.Dedent, 0, 0, this.lineIndex));
        }

        this.tokens.push(Token.from("", TokenType.Eof, 0, 0, this.lineIndex));

        return this.tokens;
    }

    private measureIndent(line: string): number {
        let indent = 0;
        for (const char of line) {
            if (char === " ") indent += 1;
            else if (char === "\t") indent += 4;
            else break;
        }
        return indent;
    }

    private handleIndentation(currentIndent: number): void {
        const previousIndent = this.indentStack[this.indentStack.length - 1];

        if (currentIndent > previousIndent) {
            this.indentStack.push(currentIndent);
            this.tokens.push(Token.from("", TokenType.Indentation, 0, currentIndent, this.lineIndex + 1));
        } else if (currentIndent < previousIndent) {
            while (currentIndent < this.indentStack[this.indentStack.length - 1]) {
                this.indentStack.pop();
                this.tokens.push(Token.from("", TokenType.Dedent, 0, 0, this.lineIndex + 1));
            }
            if (currentIndent !== this.indentStack[this.indentStack.length - 1]) {
                throw new Error(`Inconsistent indentation at line ${this.lineIndex + 1}`);
            }
        }
    }

    private tokenizeLine(line: string): void {
        let currentLine = line.trimStart(); // Indentation handled separately
        // But we need to keep track of column index relative to original line
        this.columnIndex = line.length - currentLine.length;

        while (currentLine.length > 0) {
            let matched = false;

            for (const grammar of this.grammars) {
                const match = currentLine.match(grammar.regex);
                if (match && match.index === 0) {
                    const matchedStr = match[0];

                    // Process groups
                    for (const group of grammar.groups) {
                        const groupMatch = match[group.index || 0];
                        if (groupMatch) {
                            let type = group.tokenType;
                            if (grammar.processor) {
                                type = grammar.processor(groupMatch);
                            }

                            // Don't emit tokens for things like whitespace comments if not needed
                            // But we want to consume them.
                            if (type !== TokenType.Unknown) {
                                let value: any = groupMatch;
                                if (type === TokenType.Number) {
                                    value = parseFloat(groupMatch);
                                } else if (type === TokenType.String) {
                                    value = groupMatch.slice(1, -1);
                                }

                                this.tokens.push(Token.from(
                                    value,
                                    type,
                                    this.columnIndex,
                                    this.columnIndex + matchedStr.length,
                                    this.lineIndex + 1
                                ));
                            }
                        }
                    }

                    this.columnIndex += matchedStr.length;
                    currentLine = currentLine.substring(matchedStr.length);
                    matched = true;
                    break;
                }
            }

            if (!matched) {
                // Skip whitespace if not matched by grammar
                if (currentLine[0] === ' ' || currentLine[0] === '\t') {
                    this.columnIndex++;
                    currentLine = currentLine.substring(1);
                } else {
                    throw new Error(`Unexpected token at line ${this.lineIndex + 1}: '${currentLine[0]}'`);
                }
            }
        }
    }
}
