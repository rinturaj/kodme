export function TokenTypeValueOf(value: TokenType) {
  return TokenType[value]; // Return the name of the TokenType
}

export enum TokenType {
  // Literal Types
  Number,
  Scalar,
  Value,
  String, // Added back

  Identifier,
  Boolean, // Added for True/False

  // Math
  Plus,
  Minus,
  Star,
  Slash,

  // Keywords
  Ask,
  Show,
  If,
  Else,
  ElseIf,
  End,
  Repeat, // Added back
  Until,  // Added back
  True,   // Added back
  False,  // Added back

  //   logic types
  Assignment,
  And,
  Or,
  Gte,
  Gt,
  Lte,
  Lt,
  Equal,
  Lhs,
  Rhs,
  Operands,
  Operator,
  OperandsScalar,

  Comment,
  Indentation,
  Dedent, // Added back
  DocumentStart,
  DocumentEnd,
  Whitespace,
  Newline, // Added back (distinct from EmptyLine)
  Eof,
  EmptyLine,
  Comma,
  Colon,
  Backtick,
  Hyphen,
  Hash,
  Quote,

  NotEqual,
  Unknown,
}
