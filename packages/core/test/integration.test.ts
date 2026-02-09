import { execute, Interpreter } from "../src/index";

// Mock console.log to capture output
const originalLog = console.log;
let output: string[] = [];

beforeEach(() => {
    output = [];
    console.log = (msg: any) => output.push(String(msg));
});

afterEach(() => {
    console.log = originalLog;
});

test("Integration: Show 1 + 1", async () => {
    const source = `show 1 + 1`;
    await execute(source);
    expect(output).toContain("2");
});

test("Integration: Variables", async () => {
    const source = `
a = 10
b = 20
show a + b
`;
    await execute(source);
    expect(output).toContain("30");
});

test("Integration: If/Else", async () => {
    const source = `
if true
    show "TrueBranch"
else
    show "FalseBranch"
`;
    await execute(source);
    expect(output).toContain("TrueBranch");
    expect(output).not.toContain("FalseBranch");
});

test("Integration: Repeat", async () => {
    const source = `
count = 0
repeat 3
    count = count + 1
show count
`;
    await execute(source);
    expect(output).toContain("3");
});

import * as fs from 'fs';
import * as path from 'path';

test("Integration: Example hello.kd", async () => {
    const filePath = path.resolve(__dirname, '../../../examples/hello.kd');
    const source = fs.readFileSync(filePath, 'utf-8');
    await execute(source);
    expect(output).toContain("Hello, Kodme!");
});

test("Integration: Example fibonacci.kd", async () => {
    const filePath = path.resolve(__dirname, '../../../examples/fibonacci.kd');
    const source = fs.readFileSync(filePath, 'utf-8');
    await execute(source);
    // Fibonacci: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55...
    // My script does: 
    // a=0, b=1
    // repeat 10
    // show a (0)
    // temp = 1
    // a = 1
    // b = 1
    // ...
    // It should contain some Fibonacci numbers.
    expect(output).toContain("0");
    expect(output).toContain("1");
    expect(output).toContain("5");
    expect(output).toContain("34");
});

test("Integration: Example conditions.kd", async () => {
    const filePath = path.resolve(__dirname, '../../../examples/conditions.kd');
    const source = fs.readFileSync(filePath, 'utf-8');

    // Mock Interpreter's ask handling to avoid blocking on stdin
    // Mock Interpreter's ask handling to avoid blocking on stdin
    const originalVisitAsk = Interpreter.prototype.visitAskExpr;
    Interpreter.prototype.visitAskExpr = async function (stmt: any) {
        return "Rinturaj"; // Mock input
    };

    try {
        await execute(source);
        // "Hi Rinturaj"
        expect(output).toContain("Hi Rinturaj");
        // score = 10 -> Grade: C
        expect(output).toContain("Grade: C");
    } finally {
        // Restore original
        Interpreter.prototype.visitAskExpr = originalVisitAsk;
    }
});
