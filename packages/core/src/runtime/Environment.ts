import { Token } from "../token/token";

export class RuntimeError extends Error {
    constructor (public token: Token, message: string) {
        super(message);
        this.name = "RuntimeError";
    }
}

export class Environment {
    private values = new Map<string, any>();
    public enclosing: Environment | null;

    constructor (enclosing?: Environment) {
        this.enclosing = enclosing || null;
    }

    define(name: string, value: any): void {
        this.values.set(name, value);
    }

    assign(name: Token, value: any): void {
        if (this.values.has(name.value)) {
            this.values.set(name.value, value);
            return;
        }

        if (this.enclosing) {
            this.enclosing.assign(name, value);
            return;
        }

        throw new RuntimeError(name, `Undefined variable '${name.value}'.`);
    }

    get(name: Token): any {
        if (this.values.has(name.value)) {
            return this.values.get(name.value);
        }

        if (this.enclosing) {
            return this.enclosing.get(name);
        }

        throw new RuntimeError(name, `Undefined variable '${name.value}'.`);
    }
}
