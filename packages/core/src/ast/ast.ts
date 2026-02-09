import { Token } from "../token/token";

export interface Visitor<R> {
    visitBlockStmt(stmt: BlockStmt): R;
    visitExpressionStmt(stmt: ExpressionStmt): R;
    visitIfStmt(stmt: IfStmt): R;
    visitRepeatStmt(stmt: RepeatStmt): R;
    visitShowStmt(stmt: ShowStmt): R;
    visitVarStmt(stmt: VarStmt): R;
    visitAssignStmt(stmt: AssignStmt): R;

    visitBinaryExpr(expr: BinaryExpr): R;
    visitGroupingExpr(expr: GroupingExpr): R;
    visitLiteralExpr(expr: LiteralExpr): R;
    visitLogicalExpr(expr: LogicalExpr): R;
    visitUnaryExpr(expr: UnaryExpr): R;
    visitVariableExpr(expr: VariableExpr): R;
    visitAskExpr(expr: AskExpr): R;
}

// ... Stmt classes ...

// Remove AskStmt

// ... Expr classes ...




export abstract class Stmt {
    abstract accept<R>(visitor: Visitor<R>): R;
}

export abstract class Expr {
    abstract accept<R>(visitor: Visitor<R>): R;
}

// Statements

export class BlockStmt extends Stmt {
    constructor (public statements: Stmt[]) {
        super();
    }
    accept<R>(visitor: Visitor<R>): R {
        return visitor.visitBlockStmt(this);
    }
}

export class ExpressionStmt extends Stmt {
    constructor (public expression: Expr) {
        super();
    }
    accept<R>(visitor: Visitor<R>): R {
        return visitor.visitExpressionStmt(this);
    }
}

export class IfStmt extends Stmt {
    constructor (
        public condition: Expr,
        public thenBranch: Stmt,
        public elseBranch: Stmt | null
    ) {
        super();
    }
    accept<R>(visitor: Visitor<R>): R {
        return visitor.visitIfStmt(this);
    }
}

export class RepeatStmt extends Stmt {
    constructor (public count: Expr | null, public condition: Expr | null, public body: Stmt) {
        super();
    }
    accept<R>(visitor: Visitor<R>): R {
        return visitor.visitRepeatStmt(this);
    }
}

export class ShowStmt extends Stmt {
    constructor (public expression: Expr) {
        super();
    }
    accept<R>(visitor: Visitor<R>): R {
        return visitor.visitShowStmt(this);
    }
}



export class VarStmt extends Stmt {
    constructor (public name: Token, public initializer: Expr) {
        super();
    }
    accept<R>(visitor: Visitor<R>): R {
        return visitor.visitVarStmt(this);
    }
}

export class AssignStmt extends Stmt {
    constructor (public name: Token, public value: Expr) {
        super();
    }
    accept<R>(visitor: Visitor<R>): R {
        return visitor.visitAssignStmt(this);
    }
}

// Expressions

export class BinaryExpr extends Expr {
    constructor (
        public left: Expr,
        public operator: Token,
        public right: Expr
    ) {
        super();
    }
    accept<R>(visitor: Visitor<R>): R {
        return visitor.visitBinaryExpr(this);
    }
}

export class GroupingExpr extends Expr {
    constructor (public expression: Expr) {
        super();
    }
    accept<R>(visitor: Visitor<R>): R {
        return visitor.visitGroupingExpr(this);
    }
}

export class LiteralExpr extends Expr {
    constructor (public value: any) {
        super();
    }
    accept<R>(visitor: Visitor<R>): R {
        return visitor.visitLiteralExpr(this);
    }
}

export class LogicalExpr extends Expr {
    constructor (
        public left: Expr,
        public operator: Token,
        public right: Expr
    ) {
        super();
    }
    accept<R>(visitor: Visitor<R>): R {
        return visitor.visitLogicalExpr(this);
    }
}

export class UnaryExpr extends Expr {
    constructor (public operator: Token, public right: Expr) {
        super();
    }
    accept<R>(visitor: Visitor<R>): R {
        return visitor.visitUnaryExpr(this);
    }
}

export class VariableExpr extends Expr {
    constructor (public name: Token) {
        super();
    }
    accept<R>(visitor: Visitor<R>): R {
        return visitor.visitVariableExpr(this);
    }
}

export class AskExpr extends Expr {
    constructor (public prompt: string) {
        super();
    }
    accept<R>(visitor: Visitor<R>): R {
        return visitor.visitAskExpr(this);
    }
}
