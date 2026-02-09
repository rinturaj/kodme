import {
    Visitor,
    Stmt,
    Expr,
    BlockStmt,
    ExpressionStmt,
    IfStmt,
    RepeatStmt,
    ShowStmt,
    AskStmt,
    VarStmt,
    AssignStmt,
    BinaryExpr,
    GroupingExpr,
    LiteralExpr,
    LogicalExpr,
    UnaryExpr,
    VariableExpr,
} from "../ast/ast";
import { Environment, RuntimeError } from "../runtime/Environment";
import { Token } from "../token/token";
import { TokenType } from "../token/tokenType";

// Basic global mock for prompt/alert interactions if not in browser
// The consumer of the library can override these or provide context
// For now we use console.
const runtimeOutput = (msg: string) => console.log(msg);
// const runtimeInput = (msg: string) => prompt(msg); // Will fail in Node without polyfill

export class Interpreter implements Visitor<any> {
    private environment = new Environment();

    constructor () {
        // Global definitions can go here
    }

    interpret(statements: Stmt[]): void {
        try {
            for (const statement of statements) {
                this.execute(statement);
            }
        } catch (error) {
            console.error(error);
        }
    }

    private execute(stmt: Stmt): void {
        stmt.accept(this);
    }

    private evaluate(expr: Expr): any {
        return expr.accept(this);
    }

    // Statements

    visitBlockStmt(stmt: BlockStmt): any {
        this.executeBlock(stmt.statements, new Environment(this.environment));
        return null;
    }

    executeBlock(statements: Stmt[], environment: Environment): void {
        const previous = this.environment;
        try {
            this.environment = environment;
            for (const statement of statements) {
                this.execute(statement);
            }
        } finally {
            this.environment = previous;
        }
    }

    visitExpressionStmt(stmt: ExpressionStmt): any {
        this.evaluate(stmt.expression);
        return null;
    }

    visitIfStmt(stmt: IfStmt): any {
        if (this.isTruthy(this.evaluate(stmt.condition))) {
            this.execute(stmt.thenBranch);
        } else if (stmt.elseBranch) {
            this.execute(stmt.elseBranch);
        }
        return null;
    }

    visitRepeatStmt(stmt: RepeatStmt): any {
        // Two modes: count or condition
        if (stmt.count) {
            const count = this.evaluate(stmt.count);
            if (typeof count !== 'number') {
                // For robustness, maybe cast or throw. Kodme is strict-ish.
                // Assuming number for now.
            }
            for (let i = 0; i < count; i++) {
                this.execute(stmt.body);
            }
        } else if (stmt.condition) {
            while (!this.isTruthy(this.evaluate(stmt.condition))) {
                this.execute(stmt.body);
            }
        }
        return null;
    }

    visitShowStmt(stmt: ShowStmt): any {
        const value = this.evaluate(stmt.expression);
        runtimeOutput(this.stringify(value));
        return null;
    }

    visitAskStmt(stmt: AskStmt): any {
        // In Node.js environment, `prompt` is not available by default.
        // We should probably rely on a provided callback or throw if not available.
        // For this MVP, we might mock it or assume simple values for testing.
        // console.log(`Prompt: ${stmt.prompt}`);
        // this.environment.define(stmt.variable.lexeme, "MockAnswer"); 

        // Better: throw "Not implemented" for now or assume runtime injection.
        // Let's define a mock "answer" for now.

        // In a real implementation we'd probably use `readline` or similar in Node,
        // or `window.prompt` in browser.

        this.environment.define(stmt.variable.value, "UserAnswer");
        return null;
    }

    visitVarStmt(stmt: VarStmt): any {
        let value = null;
        if (stmt.initializer) {
            value = this.evaluate(stmt.initializer);
        }
        this.environment.define(stmt.name.value, value);
        return null;
    }

    visitAssignStmt(stmt: AssignStmt): any {
        const value = this.evaluate(stmt.value);
        // Assignments in Kodme define variables implicitly if they don't exist? 
        // Or strictly update existing ones?
        // "Undefined variable throws error" rule says strictly update.
        // But kid-friendly languages often auto-define on assignment.
        // Rules say: "undefined variable throws error" in Runtime Rules.
        // So we use assign().
        // Wait, if we want to allow `a = 10` to create `a`, we should check.
        // But `Runtime Rules` say "undefined variable throws error".
        // I will stick to definition via...? 
        // Wait, logic: grammar has `assignment_statement`. It effectively IS the declaration in many scripting langs.
        // "Assignment with =" feature listed. No separate "var" keyword listed.
        // So `a = 10` MUST define `a` if it doesn't exist.

        try {
            this.environment.assign(stmt.name, value);
        } catch (e) {
            // If undefined, define it in current scope.
            this.environment.define(stmt.name.value, value);
        }

        return value;
    }

    // Expressions

    visitBinaryExpr(expr: BinaryExpr): any {
        const left = this.evaluate(expr.left);
        const right = this.evaluate(expr.right);

        switch (expr.operator.type) {
            case TokenType.Minus:
                return left - right;
            case TokenType.Slash:
                return left / right;
            case TokenType.Star:
                return left * right;
            case TokenType.Plus:
                if (typeof left === "string" || typeof right === "string") {
                    return left + right; // Concatenation
                }
                return left + right; // Addition
            case TokenType.Gt:
                return left > right;
            case TokenType.Gte:
                return left >= right;
            case TokenType.Lt:
                return left < right;
            case TokenType.Lte:
                return left <= right;
            case TokenType.NotEqual:
                return !this.isEqual(left, right);
            case TokenType.Equal: // ==
                return this.isEqual(left, right);
        }
        return null;
    }

    visitLogicalExpr(expr: LogicalExpr): any {
        const left = this.evaluate(expr.left);

        if (expr.operator.type === TokenType.Or) {
            if (this.isTruthy(left)) return left;
        } else {
            if (!this.isTruthy(left)) return left;
        }

        return this.evaluate(expr.right);
    }

    visitGroupingExpr(expr: GroupingExpr): any {
        return this.evaluate(expr.expression);
    }

    visitLiteralExpr(expr: LiteralExpr): any {
        return expr.value;
    }

    visitUnaryExpr(expr: UnaryExpr): any {
        const right = this.evaluate(expr.right);

        switch (expr.operator.type) {
            // case TokenType.Bang: // Not in grammar yet? `not` keyword used.
            //   return !this.isTruthy(right);
            case TokenType.Minus:
                return -right;
        }
        return null;
    }

    visitVariableExpr(expr: VariableExpr): any {
        // Note: VariableExpr in AST has `name: Token`. 
        // Does it use `lexeme` or `value`? 
        // `Interpreter` should rely on what `Lexer` produces.
        // `Lexer` produces Tokens. `Token.value` (literal) vs `Token.lexeme` (string source).
        // Identifiers usually store name in `lexeme` or `value` (if handled by processor).
        // In `LexerEngine`, identifiers are just text. `value` might be the string itself.
        // `Token.ts` has `value`. Token.lexeme was removed by user.
        // So access `name.value`.

        // Wait, I used `name.lexeme` in Environment.
        // Check `Token` class again.
        // User removed `lexeme` and used `value`.
        // I need to update Environment to use `value` instead of `lexeme`.

        return this.environment.get(expr.name);
    }

    // Helpers

    private isTruthy(object: any): boolean {
        if (object === null) return false;
        if (object === false) return false;
        return true;
    }

    private isEqual(a: any, b: any): boolean {
        return a === b;
    }

    private stringify(object: any): string {
        if (object === null) return "nil";
        return String(object);
    }
}
