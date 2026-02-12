<script lang="ts">
    import { Interpreter } from "@kodme/core";
    import { docs, type DocSection } from "./docs";
    import Editor from "./Editor.svelte";
    import { tick } from "svelte";
    import AskModal from "./AskModal.svelte";
    import { soundManager } from "./SoundManager";

    let sourceCode = 'show "Hello, Kodme!"';
    let output: string[] = [];
    let isRunning = false;
    let isSuccess = false;
    let activeDoc: DocSection | null = docs[0];
    let editorComponent: Editor; // Reference to Editor component

    // Ask Modal State
    let showAskModal = false;
    let askPrompt = "";
    let askResolve: ((value: string) => void) | null = null;
    let askValue = "";

    async function scrollConsole() {
        await tick();
        const outEl = document.getElementById("console-output");
        if (outEl) outEl.scrollTop = outEl.scrollHeight;
    }

    function handleAskSubmit(event: CustomEvent<string>) {
        if (askResolve) {
            askResolve(event.detail);
            askResolve = null;
        }
        showAskModal = false;
        askValue = "";
    }

    async function runCode() {
        output = []; // Clear previous output
        isRunning = true;
        isSuccess = false;

        const interpreter = new Interpreter({
            print: (msg: string) => {
                output = [...output, msg];
                scrollConsole();
            },
            ask: async (prompt: string) => {
                // Show question in console
                output = [...output, `> ${prompt}`];
                await scrollConsole();

                // Open Modal and wait for user
                return new Promise<string>((resolve) => {
                    askPrompt = prompt;
                    askResolve = (result) => {
                        // Update console with result
                        output[output.length - 1] = `> ${prompt} ${result}`;
                        resolve(result);
                    };
                    showAskModal = true;
                });
            },
        });

        try {
            const { LexerEngine, Parser } = await import("@kodme/core");

            const lexer = new LexerEngine(sourceCode);
            const tokens = lexer.tokenize();
            const parser = new Parser(tokens);
            const statements = parser.parse();

            await interpreter.interpret(statements);
            isSuccess = true;
            soundManager.playSuccess();
        } catch (err: any) {
            output = [...output, `🚫 Error: ${err.message}`];
            console.error(err);
            isSuccess = false;
            soundManager.playFailure();
        } finally {
            isRunning = false;
            scrollConsole();
        }
    }

    async function loadExample(code: string | undefined) {
        if (code) {
            if (sourceCode.trim().length > 0) {
                sourceCode += "\n\n" + code;
            } else {
                sourceCode = code;
            }
            // Auto-scroll editor to bottom to show new code
            await tick();
            editorComponent.scrollToEnd();
        }
    }
</script>

<div class="playground">
    <header>
        <div class="logo">
            <h1>🚀 Kodme <span class="badge">Playground</span></h1>
        </div>
    </header>

    <main>
        <div class="column editor-col">
            <div class="card">
                <div class="card-header">
                    <span>✏️ Code</span>
                    <button
                        class="run-btn"
                        on:click={runCode}
                        disabled={isRunning}
                    >
                        {#if isRunning}
                            ⚙️ Running...
                        {:else}
                            ▶ Run
                        {/if}
                    </button>
                </div>
                <div class="editor-wrapper">
                    <Editor
                        bind:this={editorComponent}
                        bind:code={sourceCode}
                        placeholder="Type your code here..."
                    />
                </div>
            </div>

            <div class="card output-card">
                <div class="card-header">
                    <div class="header-left">
                        <span>🖥️ Output</span>
                        {#if isSuccess}
                            <span class="success-msg">🎉 Great Job!</span>
                        {/if}
                    </div>
                    {#if output.length > 0}
                        <button
                            class="clear-btn"
                            on:click={() => {
                                output = [];
                                isSuccess = false;
                            }}>Clear</button
                        >
                    {/if}
                </div>
                <div id="console-output" class="console">
                    {#if output.length === 0}
                        <div class="placeholder">
                            Result will appear here...
                        </div>
                    {/if}
                    {#each output as line}
                        <div class="log-line">
                            <span class="prompt-char">➜</span>
                            {line}
                        </div>
                    {/each}
                </div>
            </div>
        </div>

        <div class="column docs-col">
            <div class="card">
                <div class="card-header">📚 Learn</div>
                <div class="docs-content">
                    <nav class="docs-nav">
                        {#each docs as doc}
                            <button
                                class="nav-item"
                                class:active={activeDoc?.id === doc.id}
                                on:click={() => (activeDoc = doc)}
                            >
                                {doc.title}
                            </button>
                        {/each}
                    </nav>

                    {#if activeDoc}
                        <div class="doc-details">
                            <h3>{activeDoc.title}</h3>
                            <p>{activeDoc.content}</p>
                            {#if activeDoc.code}
                                <div class="code-preview">
                                    <div class="preview-header">Example</div>
                                    <pre>{activeDoc.code}</pre>
                                    <button
                                        class="copy-btn"
                                        on:click={() =>
                                            loadExample(activeDoc?.code)}
                                    >
                                        ✨ Append this example
                                    </button>
                                </div>
                            {/if}
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </main>

    {#if showAskModal}
        <AskModal
            prompt={askPrompt}
            bind:value={askValue}
            on:submit={handleAskSubmit}
        />
    {/if}
</div>

<style>
    .playground {
        display: flex;
        flex-direction: column;
        height: 100vh;
        background-color: var(--bg-color);
        padding: 1rem;
        gap: 1rem;
    }

    header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 1rem;
    }

    .logo h1 {
        font-size: 1.8rem;
        font-weight: 800;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 0.8rem;
        color: var(--text-color);
        letter-spacing: -0.02em;
    }

    .badge {
        font-size: 0.8rem;
        background: var(--primary-color);
        color: white;
        padding: 0.3rem 0.6rem;
        border-radius: 99px;
        font-weight: 700;
        transform: rotate(-5deg);
        display: inline-block;
        box-shadow: var(--shadow-sm);
    }

    .run-btn {
        background-color: var(--success-color);
        color: white;
        border: none;
        font-weight: 800;
        font-size: 0.9rem;
        padding: 0.4rem 1rem;
        border-radius: var(--border-radius-md);
        box-shadow: 0 3px 0 #059669; /* 3D button effect */
        transition: transform 0.1s;
    }
    .run-btn:active {
        transform: translateY(3px);
        box-shadow: 0 0 0 #059669;
    }
    .run-btn:hover {
        background-color: #059669;
        transform: translateY(1px);
        box-shadow: 0 2px 0 #047857;
    }
    .run-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        box-shadow: none;
        transform: none;
    }

    main {
        flex: 1;
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 1.5rem;
        min-height: 0; /* Prevent overflow issues */
    }

    .column {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        min-height: 0;
    }

    .editor-col {
        display: grid;
        grid-template-rows: 2fr 1fr; /* more space for code, less for output */
        gap: 1.5rem;
    }

    .card {
        background: var(--surface-color);
        border-radius: var(--border-radius-lg);
        box-shadow: var(--shadow-md);
        border: 1px solid var(--border-color);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        height: 100%;
    }

    .card-header {
        padding: 1rem 1.5rem;
        background-color: var(--surface-hover);
        font-size: 1rem;
        font-weight: 800;
        color: var(--text-color);
        border-bottom: 2px solid var(--border-color);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .header-left {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .success-msg {
        font-size: 0.9rem;
        color: var(--success-color);
        background: #dcfce7;
        padding: 0.2rem 0.6rem;
        border-radius: 99px;
        animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    @keyframes popIn {
        from {
            transform: scale(0.5);
            opacity: 0;
        }
        to {
            transform: scale(1);
            opacity: 1;
        }
    }

    .clear-btn {
        font-size: 0.8rem;
        padding: 0.3rem 0.6rem;
        background: transparent;
        color: var(--text-muted);
        box-shadow: none;
    }
    .clear-btn:hover {
        background: #e2e8f0;
        color: var(--text-color);
        transform: none;
        box-shadow: none;
    }

    .editor-wrapper {
        flex: 1;
        position: relative;
        padding: 0;
        display: flex;
        overflow: hidden; /* Ensure rounded corners */
        background-color: #f8fafc;
    }

    .console {
        flex: 1;
        padding: 1.5rem;
        overflow-y: auto;
        font-family: var(--code-font);
        font-size: 1rem;
        background-color: #1e293b; /* Keep usage of dark background for console? No, let's go light but distinct */
        background-color: #f1f5f9;
        border-bottom-left-radius: var(--border-radius-lg);
        border-bottom-right-radius: var(--border-radius-lg);
    }

    .log-line {
        padding: 0.3rem 0;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        gap: 0.5rem;
        color: var(--text-color);
    }

    .prompt-char {
        color: var(--success-color);
        font-weight: bold;
    }

    .placeholder {
        color: var(--text-muted);
        font-style: italic;
        opacity: 0.7;
    }

    /* Documentation Styles */
    .docs-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        background-color: var(--bg-color); /* Interior bg */
    }

    .docs-nav {
        padding: 1rem;
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        background: var(--surface-color);
        border-bottom: 1px solid var(--border-color);
    }

    .nav-item {
        font-size: 0.9rem;
        padding: 0.4rem 0.8rem;
        background: transparent;
        border: 2px solid var(--border-color);
        color: var(--text-muted);
        border-radius: var(--border-radius-md);
        box-shadow: none;
        font-weight: 700;
    }
    .nav-item:hover {
        background: var(--surface-hover);
        border-color: var(--primary-color);
        color: var(--primary-color);
        transform: translateY(-1px);
    }
    .nav-item.active {
        background: var(--primary-color);
        border-color: var(--primary-color);
        color: white;
        box-shadow: var(--shadow-sm);
    }

    .doc-details {
        padding: 1.5rem;
        background: var(--surface-color);
        flex: 1;
    }

    .doc-details h3 {
        color: var(--primary-color);
        margin-top: 0;
        font-size: 1.4rem;
        margin-bottom: 1rem;
    }

    .doc-details p {
        color: var(--text-color);
        margin-bottom: 1.5rem;
        font-size: 1.05rem;
        line-height: 1.7;
    }

    .code-preview {
        background: #f8fafc;
        border-radius: var(--border-radius-md);
        overflow: hidden;
        border: 2px solid var(--border-color);
    }

    .preview-header {
        background: #f1f5f9;
        padding: 0.5rem 1rem;
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--text-muted);
        text-transform: uppercase;
        border-bottom: 2px solid var(--border-color);
    }

    .code-preview pre {
        background: transparent;
        margin: 0;
        padding: 1rem;
        font-size: 0.95rem;
        border: none;
    }

    .copy-btn {
        width: 100%;
        border-radius: 0;
        font-size: 1rem;
        padding: 0.8rem;
        border-top: 2px solid var(--border-color);
        background: var(--surface-color);
        color: var(--accent-color);
        box-shadow: none;
    }
    .copy-btn:hover {
        background: var(--accent-color);
        color: white;
    }
</style>
