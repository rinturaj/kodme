import { LexerEngine } from "../src/lexer/lexer.engine";
import { TokenType } from "../src/token/tokenType";

test("Lexer: Basic assignment", () => {
    const source = 'a = 10';
    const lexer = new LexerEngine(source);
    const tokens = lexer.tokenize();

    // a -> Identifier
    // = -> Assignment
    // 10 -> Number
    // \n -> Newline (Lexer expects newline at end of line processing)
    // EOF

    expect(tokens[0].type).toBe(TokenType.Identifier);
    expect(tokens[0].value).toBe("a");
    expect(tokens[1].type).toBe(TokenType.Assignment);
    expect(tokens[2].type).toBe(TokenType.Number);
    expect(tokens[2].value).toBe(10); // LexerEngine parses values
});

test("Lexer: Indentation block", () => {
    const source = `
if true
    show "Hello"
`;
    // Line 1: empty -> ignored
    // Line 2: "if true"
    //   if -> If
    //   true -> True
    //   Newline
    // Line 3: "    show "Hello""
    //   Indent
    //   show -> Show
    //   "Hello" -> String
    //   Newline
    // EOF -> Dedent, EOF

    const lexer = new LexerEngine(source);
    const tokens = lexer.tokenize();

    // Filter out pure newlines for easier checking if needed, but let's check exact sequence
    const types = tokens.map(t => TokenType[t.type]);

    // Expected sequence:
    // If, True, Newline
    // Indentation, Show, String, Newline
    // Dedent, Eof

    // Note: My implementation emits Newline after every line.

    const expected = [
        "If", "True", "Newline",
        "Indentation", "Show", "String", "Newline",
        "Dedent", "Eof"
    ];

    expect(types).toEqual(expected);
});
