import { execute } from "../src/index";

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

test("Integration: Show 1 + 1", () => {
    const source = `show 1 + 1`;
    execute(source);
    expect(output).toContain("2");
});

test("Integration: Variables", () => {
    const source = `
a = 10
b = 20
show a + b
`;
    execute(source);
    expect(output).toContain("30");
});

test("Integration: If/Else", () => {
    const source = `
if true
    show "TrueBranch"
else
    show "FalseBranch"
`;
    execute(source);
    expect(output).toContain("TrueBranch");
    expect(output).not.toContain("FalseBranch");
});

test("Integration: Repeat", () => {
    const source = `
count = 0
repeat 3
    count = count + 1
show count
`;
    execute(source);
    expect(output).toContain("3");
});

import * as fs from 'fs';
import * as path from 'path';

test("Integration: Example hello.kd", () => {
    const filePath = path.resolve(__dirname, '../../../examples/hello.kd');
    const source = fs.readFileSync(filePath, 'utf-8');
    execute(source);
    expect(output).toContain("Hello, Kodme!");
});

test("Integration: Example fibonacci.kd", () => {
    const filePath = path.resolve(__dirname, '../../../examples/fibonacci.kd');
    const source = fs.readFileSync(filePath, 'utf-8');
    execute(source);
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
    expect(output).toContain("34");
});

test("Integration: Example conditions.kd", () => {
    const filePath = path.resolve(__dirname, '../../../examples/conditions.kd');
    const source = fs.readFileSync(filePath, 'utf-8');
    execute(source);
    // score = 85. Expect Grade: B.
    expect(output).toContain("Grade: B");
});
