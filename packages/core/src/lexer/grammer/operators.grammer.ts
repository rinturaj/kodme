import { TokenType } from "../../token/tokenType";
import { LexerGrammar } from "../lexer.types";

const operatorMap: Record<string, TokenType> = {
  "==": TokenType.Equal,  // User has Equal (likely ==) and Assignment
  "!=": TokenType.NotEqual,
  ">=": TokenType.Gte,    // User has Gte, Lte
  "<=": TokenType.Lte,
  "=": TokenType.Assignment,
  ">": TokenType.Gt,
  "<": TokenType.Lt,
  "+": TokenType.Unknown, // User removed Plus/Minus/Star/Slash? Let's check TokenType again
  "-": TokenType.Hyphen,  // User has Hyphen
  "*": TokenType.Unknown,
  "/": TokenType.Unknown,
  "(": TokenType.Unknown, // User removed LeftParen?
  ")": TokenType.Unknown,
  ",": TokenType.Comma,
};

// Start by reading the actual TokenType file to see what we have to work with.
// The user edits were:
// Assignment, And, Or, Gte, Gt, Lte, Lt, Equal, Lhs, Rhs, Operands, Operator...
// Comma, Colon, Backtick, Hyphen, Hash, Quote
// NotEqual, Unknown

export const operatorsGrammar: LexerGrammar = {
  name: "operators",
  // Added +, *, /, (, ) to regex. Note escaping for special chars.
  regex: /^(==|!=|>=|<=|=|>|<|\+|-|\*|\/|\(|\)|,|:)/,
  groups: [
    {
      tokenType: TokenType.Unknown,
      index: 1,
    },
  ],
  processor: (match: string) => {
    switch (match) {
      case "=": return TokenType.Assignment;
      case "==": return TokenType.Equal;
      case "!=": return TokenType.NotEqual;
      case ">=": return TokenType.Gte;
      case "<=": return TokenType.Lte;
      case ">": return TokenType.Gt;
      case "<": return TokenType.Lt;
      case ",": return TokenType.Comma;
      case ":": return TokenType.Colon;
      case "-": return TokenType.Minus;
      case "+": return TokenType.Plus;
      case "*": return TokenType.Star;
      case "/": return TokenType.Slash;
    }
    return TokenType.Unknown;
  }
};
