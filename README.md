# Kodme

A simple, beginner-friendly programming language for learning programming concepts.

## Features

- Simple and readable syntax
- Interactive input/output
- Conditional statements
- Loops
- Basic arithmetic operations
- Variables

## Installation

```bash
# Clone the repository
git clone https://github.com/rinturaj/kodme.git
cd kodme

# Install dependencies
pnpm install

# Build the project
pnpm build
```

## Running the Interpreter

You can run Kodme programs in two ways:

1. **Interactive Mode**:
   ```bash
   # Start the interactive REPL
   pnpm start
   ```
   Then type your Kodme code directly into the prompt.

2. **Run a Kodme file**:
   ```bash
   # Run a .kodme file
   pnpm start path/to/your/program.kodme
   ```

   Create a file with a `.kodme` extension and write your code in it. For example, `hello.kodme`:
   ```kodme
   name = ask "What is your name?"
   show "Hello, " name
   ```
   Then run it with:
   ```bash
   pnpm start hello.kodme
   ```

## Getting Started

Here's a simple example program in Kodme:

```kodme
# Ask for user's name and greet them
name = ask "What is your name?"
show "Hi " name

# Check if user is an adult or a kid
age = ask "How old are you?"
if age > 18
    show "Adult"
else
    show "Kid"

# Count from 1 to 5
x = 1
repeat until x > 5
    show x
    x = x + 1
```

## Language Reference

### Variables
```kodme
# Variable assignment
name = "Alice"
age = 25
```

### Input/Output
```kodme
# Get input from user
name = ask "What's your name?"

# Display output
show "Hello, " name
```

### Conditionals
```kodme
if age > 18
    show "Adult"
else if age > 12
    show "Teen"
else
    show "Child"
```

### Loops

Kodme supports two types of loops:

1. **Repeat with condition**:
```kodme
# Repeat until condition is false
x = 1
repeat until x > 5
    show x
    x = x + 1
```

2. **Repeat fixed number of times**:
```kodme
# Repeat 5 times
repeat 5
    show "Hello, Kodme!"

# You can also use a variable
count = 3
repeat count
    show "This will print 3 times"
```

## Project Structure

- `/packages/core` - Core language implementation
- `/apps/playground` - Web-based playground for trying out Kodme

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](LICENSE)
