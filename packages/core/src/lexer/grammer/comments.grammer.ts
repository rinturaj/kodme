import { TokenType } from "../../token/tokenType";
import { LexerGrammar } from "../lexer.types";

export const commentsGrammar: LexerGrammar = {
    name: "comments",
    regex: /^#.*/, // Hash style comments
    groups: [
        {
            tokenType: TokenType.Comment,
            index: 0,
        },
    ],
};
