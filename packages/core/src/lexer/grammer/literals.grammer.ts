import { TokenType } from "../../token/tokenType";
import { LexerGrammar } from "../lexer.types";

export const literalsGrammar: LexerGrammar = {
    name: "literals",
    // Match string, number, or identifier
    // String: "..."
    // Number: digits (. digits)?
    // Identifier: alpha (alphanum | _)*
    regex: /^("[^"]*"|\d+(\.\d+)?|[a-zA-Z_][a-zA-Z0-9_]*)/,
    groups: [
        {
            tokenType: TokenType.Unknown, // Will be determined by processor
            index: 0,
        },
    ],
    processor: (match: string) => {
        if (match.startsWith('"')) return TokenType.String;
        if (/^\d/.test(match)) return TokenType.Number;
        return TokenType.Identifier;
    },
};
