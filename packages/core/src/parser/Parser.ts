import { Token } from "../token/token";
import { TokenType } from "../token/tokenType";
import {
    Stmt,
    BlockStmt,
    ExpressionStmt,
    IfStmt,
    RepeatStmt,
    ShowStmt,
    AskStmt,
    VarStmt,
    AssignStmt,
    Expr,
    BinaryExpr,
    GroupingExpr,
    LiteralExpr,
    LogicalExpr,
    UnaryExpr,
    VariableExpr,
} from "../ast/ast";

export class ParserError extends Error {
    constructor (public token: Token, message: string) {
        super(message);
        this.name = "ParserError";
    }
}

export class Parser {
    private tokens: Token[];
    private current = 0;

    constructor (tokens: Token[]) {
        this.tokens = tokens;
    }

    parse(): Stmt[] {
        const statements: Stmt[] = [];
        while (!this.isAtEnd()) {
            // Allow empty lines / newlines between statements
            if (this.match(TokenType.Newline)) continue;

            const decl = this.declaration();
            if (decl) statements.push(decl);
        }
        return statements;
    }

    private declaration(): Stmt | null {
        try {
            // In Kodme, assignment is a statement: `id = expr`
            // But we need to distinguish `id = expr` from `id + 1` (ExprStmt).
            // Since assignments start with Identifier, we peek.
            if (this.check(TokenType.Identifier) && this.checkNext(TokenType.Assignment)) {
                return this.assignment();
            }

            return this.statement();
        } catch (error) {
            this.synchronize();
            return null;
        }
    }

    private assignment(): Stmt {
        const name = this.consume(TokenType.Identifier, "Expect variable name.");
        this.consume(TokenType.Assignment, "Expect '=' after variable name.");
        const value = this.expression();
        this.consume(TokenType.Newline, "Expect newline after assignment.");
        return new AssignStmt(name, value);
    }

    private statement(): Stmt {
        if (this.match(TokenType.Show)) return this.showStatement();
        if (this.match(TokenType.Ask)) return this.askStatement();
        if (this.match(TokenType.If)) return this.ifStatement();
        if (this.match(TokenType.Repeat)) return this.repeatStatement();
        if (this.match(TokenType.Indentation)) return this.block();

        return this.expressionStatement();
    }

    private showStatement(): Stmt {
        const value = this.expression();
        this.consume(TokenType.Newline, "Expect newline after show value.");
        return new ShowStmt(value);
    }

    private askStatement(): Stmt {
        // ask "Prompt" variable
        const promptToken = this.consume(TokenType.String, "Expect prompt string after 'ask'.");
        const variable = this.consume(TokenType.Identifier, "Expect variable name after prompt string.");
        this.consume(TokenType.Newline, "Expect newline after ask statement.");
        return new AskStmt(promptToken.value, variable); // value is the literal string
    }

    private ifStatement(): Stmt {
        const condition = this.expression();
        this.consume(TokenType.Newline, "Expect newline after if condition.");

        // The "then" branch is a block. 
        // In our grammar: `if expr NEWLINE block`
        // Block starts with INDENT.

        this.consume(TokenType.Indentation, "Expect indentation (block) after if statement.");
        const thenBranch = this.block();

        let elseBranch: Stmt | null = null;
        if (this.match(TokenType.Else)) {
            // else can be followed by `if` (else if) or a block.
            if (this.match(TokenType.If)) {
                // recursive parse for else-if, effectively
                // But `match(If)` consumes the token. So valid grammar for `if` calls `ifStatement` directly?
                // Actually, `else if` is `else` followed by `ifStatement`.

                // We already consumed `Else`.
                // `If` was consumed by `match(If)`.
                // We can just call `ifStatement` again?
                // But `ifStatement` assumes `if` was just matched/consumed by `statement()`.
                // So, to reuse `ifStatement`, we proceed. 
                // Wait, `ifStatement` does NOT consume `if`. It is called AFTER `if` is consumed in `statement()`.
                // So if we consumed `If`, we can call `ifStatement()`.
                elseBranch = this.ifStatement();
            } else {
                this.consume(TokenType.Newline, "Expect newline after else.");
                this.consume(TokenType.Indentation, "Expect indentation after else.");
                elseBranch = this.block();
            }
        }

        return new IfStmt(condition, thenBranch, elseBranch);
    }

    private repeatStatement(): Stmt {
        // repeat N
        // OR
        // repeat until Condition

        if (this.match(TokenType.Until)) {
            const condition = this.expression();
            this.consume(TokenType.Newline, "Expect newline after repeat until condition.");
            this.consume(TokenType.Indentation, "Expect indentation after repeat.");
            const body = this.block();
            return new RepeatStmt(null, condition, body);
        } else {
            const count = this.expression();
            this.consume(TokenType.Newline, "Expect newline after repeat count.");
            this.consume(TokenType.Indentation, "Expect indentation after repeat.");
            const body = this.block();
            return new RepeatStmt(count, null, body);
        }
    }

    private block(): Stmt {
        const statements: Stmt[] = [];

        while (!this.check(TokenType.Dedent) && !this.isAtEnd()) {
            // Skip newlines inside block
            if (this.match(TokenType.Newline)) continue;

            const decl = this.declaration();
            if (decl) statements.push(decl);
        }

        this.consume(TokenType.Dedent, "Expect dedent after block.");
        return new BlockStmt(statements);
    }

    private expressionStatement(): Stmt {
        const expr = this.expression();
        this.consume(TokenType.Newline, "Expect newline after expression.");
        return new ExpressionStmt(expr);
    }

    private expression(): Expr {
        return this.logicalOr();
    }

    private logicalOr(): Expr {
        let expr = this.logicalAnd();

        while (this.match(TokenType.Or)) {
            const operator = this.previous();
            const right = this.logicalAnd();
            expr = new LogicalExpr(expr, operator, right);
        }
        return expr;
    }

    private logicalAnd(): Expr {
        let expr = this.equality();

        while (this.match(TokenType.And)) {
            const operator = this.previous();
            const right = this.equality();
            expr = new LogicalExpr(expr, operator, right);
        }
        return expr;
    }

    private equality(): Expr {
        let expr = this.comparison();

        while (this.match(TokenType.Equal, TokenType.NotEqual)) { // Assuming Equal is ==
            const operator = this.previous();
            const right = this.comparison();
            expr = new BinaryExpr(expr, operator, right);
        }

        return expr;
    }

    private comparison(): Expr {
        let expr = this.term();

        while (this.match(TokenType.Gt, TokenType.Gte, TokenType.Lt, TokenType.Lte)) {
            const operator = this.previous();
            const right = this.term();
            expr = new BinaryExpr(expr, operator, right);
        }

        return expr;
    }

    private term(): Expr {
        let expr = this.factor();

        while (this.match(TokenType.Minus, TokenType.Plus)) {
            const operator = this.previous();
            const right = this.factor();
            expr = new BinaryExpr(expr, operator, right);
        }
        return expr;
    }

    private factor(): Expr {
        let expr = this.unary();

        while (this.match(TokenType.Slash, TokenType.Star)) {
            const operator = this.previous();
            const right = this.unary();
            expr = new BinaryExpr(expr, operator, right);
        }

        return expr;
    }

    private unary(): Expr {
        if (this.match(TokenType.NotEqual, TokenType.Minus)) { // ! or -
            const operator = this.previous();
            const right = this.unary();
            return new UnaryExpr(operator, right);
        }

        return this.primary();
    }

    private primary(): Expr {
        if (this.match(TokenType.False)) return new LiteralExpr(false);
        if (this.match(TokenType.True)) return new LiteralExpr(true);

        if (this.match(TokenType.Number, TokenType.String)) {
            return new LiteralExpr(this.previous().value);
        }

        if (this.match(TokenType.Identifier)) {
            return new VariableExpr(this.previous());
        }

        if (this.match(TokenType.Unknown)) { // LeftParen?
            // if (this.previous().lexeme === "(") ...
            // Need reliable TokenTypes.
        }

        throw this.error(this.peek(), "Expect expression.");
    }

    // Helpers

    private match(...types: TokenType[]): boolean {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }

    private check(type: TokenType): boolean {
        if (this.isAtEnd()) return false;
        return this.peek().type === type;
    }

    private checkNext(type: TokenType): boolean {
        if (this.current + 1 >= this.tokens.length) return false;
        return this.tokens[this.current + 1].type === type;
    }

    private advance(): Token {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }

    private isAtEnd(): boolean {
        return this.peek().type === TokenType.Eof;
    }

    private peek(): Token {
        return this.tokens[this.current];
    }

    private previous(): Token {
        return this.tokens[this.current - 1];
    }

    private consume(type: TokenType, message: string): Token {
        if (this.check(type)) return this.advance();
        throw this.error(this.peek(), message);
    }

    private error(token: Token, message: string): ParserError {
        return new ParserError(token, message + ` at line ${token.position?.line}`);
    }

    private synchronize(): void {
        this.advance();

        while (!this.isAtEnd()) {
            if (this.previous().type === TokenType.Newline) return;

            switch (this.peek().type) {
                case TokenType.If:
                case TokenType.Show:
                case TokenType.Ask:
                case TokenType.Repeat:
                    return;
            }

            this.advance();
        }
    }
}
