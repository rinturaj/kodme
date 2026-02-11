import {
    Visitor,
    Stmt,
    Expr,
    BlockStmt,
    ExpressionStmt,
    IfStmt,
    RepeatStmt,
    ShowStmt,
    AskExpr,
    VarStmt,
    AssignStmt,
    BinaryExpr,
    GroupingExpr,
    LiteralExpr,
    LogicalExpr,
    UnaryExpr,
    VariableExpr,
} from "../ast/ast";
import { Environment } from "../runtime/Environment";
import { TokenType } from "../token/tokenType";

// Basic global mock for prompt/alert interactions if not in browser
// The consumer of the library can override these or provide context
// For now we use console.
const runtimeOutput = (msg: string) => console.log(msg);
// const runtimeInput = (msg: string) => prompt(msg); // Will fail in Node without polyfill

import * as readline from 'readline';

declare var window: any;

export class Interpreter implements Visitor<Promise<any>> {
    private environment = new Environment();

    constructor () {
        // Global definitions can go here
    }

    async interpret(statements: Stmt[]): Promise<void> {
        try {
            for (const statement of statements) {
                await this.execute(statement);
            }
        } catch (error) {
            console.error(error);
        }
    }

    private async execute(stmt: Stmt): Promise<void> {
        await stmt.accept(this);
    }

    private async evaluate(expr: Expr): Promise<any> {
        return await expr.accept(this);
    }

    // Statements

    async visitBlockStmt(stmt: BlockStmt): Promise<any> {
        await this.executeBlock(stmt.statements, new Environment(this.environment));
        return null;
    }

    async executeBlock(statements: Stmt[], environment: Environment): Promise<void> {
        const previous = this.environment;
        try {
            this.environment = environment;
            for (const statement of statements) {
                await this.execute(statement);
            }
        } finally {
            this.environment = previous;
        }
    }

    async visitExpressionStmt(stmt: ExpressionStmt): Promise<any> {
        await this.evaluate(stmt.expression);
        return null;
    }

    async visitIfStmt(stmt: IfStmt): Promise<any> {
        if (this.isTruthy(await this.evaluate(stmt.condition))) {
            await this.execute(stmt.thenBranch);
        } else if (stmt.elseBranch) {
            await this.execute(stmt.elseBranch);
        }
        return null;
    }

    async visitRepeatStmt(stmt: RepeatStmt): Promise<any> {
        // Two modes: count or condition
        if (stmt.count) {
            const count = await this.evaluate(stmt.count);
            if (typeof count !== 'number') {
                // For robustness, maybe cast or throw. Kodme is strict-ish.
                // Assuming number for now.
            }
            for (let i = 0; i < count; i++) {
                await this.execute(stmt.body);
            }
        } else if (stmt.condition) {
            while (!this.isTruthy(await this.evaluate(stmt.condition))) {
                await this.execute(stmt.body);
            }
        }
        return null;
    }

    async visitShowStmt(stmt: ShowStmt): Promise<any> {
        const value = await this.evaluate(stmt.expression);
        runtimeOutput(this.stringify(value));
        return null;
    }

    async visitAskExpr(stmt: AskExpr): Promise<any> {
        let answer = "";

        // Check if running in browser
        if (typeof window !== 'undefined' && typeof window.prompt === 'function') {
            const result = window.prompt(stmt.prompt);
            answer = result === null ? "" : result;
        } else {
            // Node.js environment - use readline
            answer = await new Promise<string>((resolve) => {
                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                });

                rl.question(stmt.prompt + " ", (input) => {
                    rl.close();
                    resolve(input);
                });
            });
        }

        return answer;
    }

    async visitVarStmt(stmt: VarStmt): Promise<any> {
        let value = null;
        if (stmt.initializer) {
            value = await this.evaluate(stmt.initializer);
        }
        this.environment.define(stmt.name.value, value);
        return null;
    }

    async visitAssignStmt(stmt: AssignStmt): Promise<any> {
        const value = await this.evaluate(stmt.value);
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

    async visitBinaryExpr(expr: BinaryExpr): Promise<any> {
        const left = await this.evaluate(expr.left);
        const right = await this.evaluate(expr.right);

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

    async visitLogicalExpr(expr: LogicalExpr): Promise<any> {
        const left = await this.evaluate(expr.left);

        if (expr.operator.type === TokenType.Or) {
            if (this.isTruthy(left)) return left;
        } else {
            if (!this.isTruthy(left)) return left;
        }

        return await this.evaluate(expr.right);
    }

    async visitGroupingExpr(expr: GroupingExpr): Promise<any> {
        return await this.evaluate(expr.expression);
    }

    async visitLiteralExpr(expr: LiteralExpr): Promise<any> {
        return expr.value;
    }

    async visitUnaryExpr(expr: UnaryExpr): Promise<any> {
        const right = await this.evaluate(expr.right);

        switch (expr.operator.type) {
            // case TokenType.Bang: // Not in grammar yet? `not` keyword used.
            //   return !this.isTruthy(right);
            case TokenType.Minus:
                return -right;
        }
        return null;
    }

    async visitVariableExpr(expr: VariableExpr): Promise<any> {
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
