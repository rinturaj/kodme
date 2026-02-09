import { LexerEngine } from "./lexer/lexer.engine";
import { Parser } from "./parser/Parser";
import { Interpreter } from "./interpreter/Interpreter";

// Re-export for external usage
export { LexerEngine, Parser, Interpreter };

// Convenience function
export function execute(source: string) {
  const lexer = new LexerEngine(source);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  const statements = parser.parse();
  const interpreter = new Interpreter();
  interpreter.interpret(statements);
}

export default Interpreter;
