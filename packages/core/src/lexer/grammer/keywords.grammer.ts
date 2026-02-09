import { TokenType } from "../../token/tokenType";
import { LexerGrammar } from "../lexer.types";

const keywordMap: Record<string, TokenType> = {
    show: TokenType.Show,
    ask: TokenType.Ask,
    if: TokenType.If,
    else: TokenType.Else,
    repeat: TokenType.Repeat,
    until: TokenType.Until,
    true: TokenType.True,
    false: TokenType.False,
    and: TokenType.And,
    or: TokenType.Or,
};

export const keywordsGrammar: LexerGrammar = {
    name: "keywords",
    regex: /^(show|ask|if|else|repeat|until|true|false|and|or)\b/,
    groups: [
        {
            tokenType: TokenType.Unknown, // Resolved by processor
            index: 1,
        },
    ],
    processor: (match: string) => {
        return keywordMap[match] || TokenType.Identifier;
    },
};
