<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { fade, scale } from "svelte/transition";

    export let prompt: string = "";
    export let value: string = "";

    const dispatch = createEventDispatcher();

    function handleSubmit() {
        dispatch("submit", value);
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Enter") {
            handleSubmit();
        }
    }
</script>

<div class="modal-backdrop" transition:fade={{ duration: 200 }}>
    <div class="modal-content" transition:scale={{ duration: 200, start: 0.9 }}>
        <h3>{prompt}</h3>
        <input
            type="text"
            bind:value
            on:keydown={handleKeydown}
            placeholder="Type your answer..."
            autofocus
        />
        <div class="actions">
            <button on:click={handleSubmit}>Submit</button>
        </div>
    </div>
</div>

<style>
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
        backdrop-filter: blur(2px);
    }

    .modal-content {
        background: white;
        padding: 2rem;
        border-radius: 1rem;
        width: 90%;
        max-width: 400px;
        box-shadow:
            0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    h3 {
        margin: 0;
        color: #1e293b;
        font-size: 1.25rem;
        font-weight: 600;
    }

    input {
        width: 100%;
        padding: 0.75rem 1rem;
        border: 2px solid #cbd5e1;
        border-radius: 0.5rem;
        font-size: 1rem;
        outline: none;
        transition: border-color 0.2s;
    }

    input:focus {
        border-color: #3b82f6;
    }

    .actions {
        display: flex;
        justify-content: flex-end;
    }

    button {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        font-weight: 600;
        cursor: pointer;
        transition:
            transform 0.1s,
            box-shadow 0.1s;
    }

    button:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.5);
    }

    button:active {
        transform: translateY(0);
    }
</style>
