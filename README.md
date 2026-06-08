<div align="center">

# 🚀 Kodme

**A simple, beginner-friendly programming language for learning programming concepts.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Svelte](https://img.shields.io/badge/Svelte-FF3E00?style=flat&logo=svelte&logoColor=white)](https://svelte.dev)

[**Playground**](./apps/playground) • [**Documentation**](#language-reference) • [**Contributing**](#contributing)

---

</div>

## ✨ Features

| Feature                | Description                                                     |
| :--------------------- | :-------------------------------------------------------------- |
| **📝 Readable Syntax** | Code that reads like English sentences.                         |
| **🎮 Interactive**     | Built-in `ask` and `show` for fun interactions.                 |
| **🔄 Loops Made Easy** | Simple `repeat` loops for patterns and games.                   |
| **decisions Logic**    | Clear `if`, `else` structures for decision making.              |
| **🎨 Playground**      | A beautiful, kid-friendly web editor to start coding instantly. |

<br>

## 🛠️ Installation

<details>
<summary><strong>Click to see installation steps</strong></summary>

1. **Clone the repository**

   ```bash
   git clone https://github.com/rinturaj/kodme.git
   cd kodme
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Build the project**
   ```bash
   pnpm build
   ```
   </details>

<br>

## 🏃‍♂️ Running Kodme

You can run Kodme programs in two ways:

<table width="100%">
<tr>
<td width="50%" valign="top">

### 1. Interactive Mode 💬

Start the REPL and type code directly:

```bash
pnpm start
```

</td>
<td width="50%" valign="top">

### 2. Run a File 📄

Execute a specific `.kodme` file:

```bash
pnpm start path/to/program.kodme
```

</td>
</tr>
</table>

<br>

## 🚀 Getting Started

Here's a simple example program in Kodme. Create a file named `hello.kodme`:

```kodme
# Ask for user's name and greet them
name = ask "What is your name?"
show "Hi " name

# Count from 1 to 5
x = 1
repeat until x > 5
    show x
    x = x + 1
```

Run it with:

```bash
pnpm start hello.kodme
```

<br>

## 📚 Language Reference

### 📦 Variables

```kodme
name = "Alice"
age = 10
isCool = true
```

### 🗣️ Input/Output

```kodme
name = ask "Who are you?"
show "Welcome, " name
```

### 🔀 Conditionals

```kodme
if age > 18
    show "Adult"
else
    show "Kid"
```

### 🔄 Loops

```kodme
# Repeat 5 times
repeat 5
    show "Kodme is fun!"

# Repeat until condition
count = 0
repeat until count == 3
    show count
    count = count + 1
```

<br>

## 📂 Project Structure

- **`/packages/core`** - The brain of Kodme (Lexer, Parser, Interpreter).
- **`/apps/playground`** - The beautiful web interface for coding.

<br>

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

<br>

## 📄 License

[MIT](LICENSE)
