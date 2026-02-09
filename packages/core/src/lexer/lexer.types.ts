import { TokenType } from "../token/tokenType";

export interface LexerGrammar {
    name: string;
    regex: RegExp;
    groups: {
        tokenType: TokenType;
        index?: number; // Regex match group index
    }[];
    start?: RegExp;
    end?: RegExp;
    mergeLines?: boolean;
    moveNextLine?: boolean;
    loopUntil?: RegExp;
    isOptional?: boolean;
    next?: LexerGrammar[];
    processor?: (match: string) => TokenType;
}
