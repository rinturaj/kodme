<script lang="ts">
    import CodeMirror from "svelte-codemirror-editor";
    import { EditorView, lineNumbers } from "@codemirror/view";
    import { StreamLanguage } from "@codemirror/language";
    import { tags } from "@lezer/highlight";
    import { soundManager } from "./SoundManager";

    export let code = "";
    export let placeholder = "Type your code here...";

    let editorView: EditorView;

    import { onMount } from "svelte";

    // Dynamic import for core logic
    let LexerEngineClass: any;

    onMount(async () => {
        try {
            const core = await import("@kodme/core");
            LexerEngineClass = core.LexerEngine;
        } catch (e) {
            console.error("Failed to load core", e);
        }
    });

    // Extension to play sound on typing
    const typingSoundExtension = EditorView.updateListener.of((update) => {
        if (update.docChanged) {
            // Check for user input or deletion
            const isUserEvent = update.transactions.some(
                (tr) =>
                    tr.isUserEvent("input") ||
                    tr.isUserEvent("delete") ||
                    tr.isUserEvent("keyboard"),
            );

            if (isUserEvent) {
                let hasError = false;

                // Validate current line if Lexer is available
                if (LexerEngineClass) {
                    try {
                        const state = update.state;
                        // Get the line where the cursor is (or last change)
                        // Using selection head is a good proxy for typing position
                        const pos = state.selection.main.head;
                        const line = state.doc.lineAt(pos);

                        // Check strict syntax (Lexer throws on bad tokens like unclosed strings)
                        new LexerEngineClass(line.text).tokenize();
                    } catch (e) {
                        hasError = true;
                    }
                }

                if (hasError) {
                    soundManager.playTypeError();
                } else {
                    soundManager.playType();
                }
            }
        }
    });

    // Define Kodme grammar using StreamLanguage (Legacy styling)
    // This mimics the Prism grammar we had but for CodeMirror
    const kodmeLanguage = StreamLanguage.define({
        token(stream) {
            // Eat whitespace
            if (stream.eatSpace()) return null;

            // Comments
            if (stream.match(/#.*/)) return "comment";

            // Strings
            if (stream.match(/"(?:[^\\"]|\\.)*"/)) return "string";

            // Numbers
            if (stream.match(/\b\d+(\.\d+)?\b/)) return "number";

            // Keywords
            if (
                stream.match(
                    /\b(show|ask|if|else|repeat|until|true|false|and|or)\b/,
                )
            )
                return "keyword";

            // Booleans (covered by keywords but let's be specific if needed, or just let keyword handle it)
            // CodeMirror tags usually map 'keyword' to a color.

            // Operators
            if (stream.match(/==|!=|>=|<=|=|>|<|\+|-|\*|\/|,|:/))
                return "operator";

            // Functions (heuristic: word followed by open paren, lookahead not easily possible in stream without peeking)
            // StreamParser is greedy.
            // Let's just match identifiers.
            if (stream.match(/[a-z_]\w*/i)) {
                return "variableName";
            }

            // Punctuation
            if (stream.match(/[()]/)) return "punctuation";

            // Advance any other char
            stream.next();
            return null;
        },
    });

    // Custom Theme to match our Kid-Friendly Palette
    const kodmeTheme = EditorView.theme({
        "&": {
            height: "100%",
            backgroundColor: "#f8fafc",
            fontSize: "1.1rem",
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        },
        ".cm-content": {
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            padding: "1.5rem",
        },
        ".cm-scroller": {
            overflow: "auto",
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        },
        "&.cm-focused": {
            outline: "none",
        },
    });

    // Highlight Style mapping our parser to colors
    import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
    const kodmeHighlightStyle = HighlightStyle.define([
        { tag: tags.comment, color: "#94a3b8", fontStyle: "italic" },
        { tag: tags.string, color: "#10b981", fontWeight: "bold" },
        { tag: tags.keyword, color: "#7c3aed", fontWeight: "bold" },
        { tag: tags.number, color: "#f59e0b" },
        { tag: tags.operator, color: "#64748b" },
        { tag: tags.variableName, color: "#334155" }, // Default text color mostly
        { tag: tags.punctuation, color: "#64748b" },
    ]);

    function handleChange(e: CustomEvent<string>) {
        code = e.detail;
        soundManager.playType();
    }

    export function scrollToEnd() {
        if (editorView) {
            const doc = editorView.state.doc;
            editorView.dispatch({
                effects: EditorView.scrollIntoView(doc.length, { y: "end" }),
            });
        }
    }
</script>

<div class="codemirror-wrapper">
    <CodeMirror
        bind:value={code}
        lang={kodmeLanguage}
        theme={kodmeTheme}
        extensions={[
            syntaxHighlighting(kodmeHighlightStyle),
            typingSoundExtension,
        ]}
        styles={{
            "&": {
                height: "100%",
                width: "100%",
            },
        }}
        onready={(e) => {
            editorView = e.detail;
        }}
        {placeholder}
    />
</div>

<style>
    .codemirror-wrapper {
        height: 100%;
        width: 100%;
        overflow: hidden;
        border-radius: inherit;
        background-color: #f8fafc;
        overflow: auto;
    }
</style>
