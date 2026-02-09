
import { execute } from "@kodme/core";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

const args = process.argv.slice(2);

// If file argument is provided, run the file
if (args.length > 0) {
    const filePath = path.resolve(process.cwd(), args[0]);

    if (!fs.existsSync(filePath)) {
        console.error(`Error: File not found: ${filePath}`);
        process.exit(1);
    }

    try {
        const source = fs.readFileSync(filePath, "utf-8");
        execute(source);
    } catch (error) {
        console.error("Execution Error:", error);
        process.exit(1);
    }
} else {
    // REPL Mode
    startRepl();
}

function startRepl() {
    console.log("Kodme REPL v0.0.1");
    console.log("Type 'exit' to quit.");

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: "kd> "
    });

    rl.prompt();

    rl.on("line", (line) => {
        const input = line.trim();
        if (input === "exit") {
            rl.close();
            return;
        }

        if (input) {
            try {
                // Execute line by line - Note: Environment is recreated each time currently!
                // Ideally REPL should maintain state.
                // execute() helper re-creates interpreter.
                // TODO: Update core to support persistent session.
                // For now, stateless execution per line.
                execute(input);
            } catch (error: any) {
                console.error("Error:", error.message);
            }
        }

        rl.prompt();
    }).on("close", () => {
        console.log("Goodbye!");
        process.exit(0);
    });
}
