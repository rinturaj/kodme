import { LexerEngine } from "../src/lexer/lexer.engine";
import { Parser } from "../src/parser/Parser";
import {
    AssignStmt,
    BinaryExpr,
    LiteralExpr,
    ShowStmt,
    VariableExpr,
    IfStmt,
    BlockStmt,
    RepeatStmt
} from "../src/ast/ast";
import { TokenType } from "../src/token/tokenType";

function parse(source: string) {
    const lexer = new LexerEngine(source);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    return parser.parse();
}

test("Parser: Assignment", () => {
    const stmts = parse("a = 10");
    expect(stmts.length).toBe(1);
    expect(stmts[0]).toBeInstanceOf(AssignStmt);

    const assign = stmts[0] as AssignStmt;
    expect(assign.name.value).toBe("a");
    expect(assign.value).toBeInstanceOf(LiteralExpr);
    expect((assign.value as LiteralExpr).value).toBe(10);
});

test("Parser: Binary Expression Precedence", () => {
    // 1 + 2 * 3
    // Should be 1 + (2 * 3)
    const stmts = parse("show 1 + 2 * 3");
    expect(stmts.length).toBe(1);
    expect(stmts[0]).toBeInstanceOf(ShowStmt);

    const show = stmts[0] as ShowStmt;
    expect(show.expression).toBeInstanceOf(BinaryExpr);

    const binary = show.expression as BinaryExpr;
    expect(binary.operator.type).toBe(TokenType.Plus);

    expect(binary.left).toBeInstanceOf(LiteralExpr);
    expect((binary.left as LiteralExpr).value).toBe(1);

    expect(binary.right).toBeInstanceOf(BinaryExpr);
    const right = binary.right as BinaryExpr;
    expect(right.operator.type).toBe(TokenType.Star);
    expect((right.left as LiteralExpr).value).toBe(2);
    expect((right.right as LiteralExpr).value).toBe(3);
});

test("Parser: If Statement", () => {
    const source = `
if true
    show "Yes"
else
    show "No"
`;
    const stmts = parse(source);
    expect(stmts.length).toBe(1);
    expect(stmts[0]).toBeInstanceOf(IfStmt);

    const ifStmt = stmts[0] as IfStmt;
    expect(ifStmt.condition).toBeInstanceOf(LiteralExpr);
    expect((ifStmt.condition as LiteralExpr).value).toBe(true);

    expect(ifStmt.thenBranch).toBeInstanceOf(BlockStmt);
    expect((ifStmt.thenBranch as BlockStmt).statements.length).toBe(1);

    expect(ifStmt.elseBranch).toBeInstanceOf(BlockStmt);
    expect((ifStmt.elseBranch as BlockStmt).statements.length).toBe(1);
});

test("Parser: Repeat Loop", () => {
    const source = `
repeat 5
    show "Loop"
`;
    const stmts = parse(source);
    expect(stmts.length).toBe(1);
    expect(stmts[0]).toBeInstanceOf(RepeatStmt);

    const repeat = stmts[0] as RepeatStmt;
    expect(repeat.count).toBeInstanceOf(LiteralExpr); // 5
    expect(repeat.condition).toBeNull();
    expect(repeat.body).toBeInstanceOf(BlockStmt);
});
