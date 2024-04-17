<script lang="ts">
    import type { LinePlotTab } from '../../../types/state';
    import LinePlotIcon from '../../icons/LinePlot.svelte';

    export let tabObject: LinePlotTab;
    export let active: boolean;
    export let width: number;
</script>

<div class="wrapper" class:activeWrapper={active}>
    <div class="main">
        <span class="icon"><LinePlotIcon /></span>
        <span class="title"
            >{#if width > 109}Line Plot{/if}</span
        >
    </div>
    <span class="comment"
        >{#if width > 300}{tabObject.tabComment}{/if}</span
    >
</div>

<style>
    .wrapper {
        display: flex;
        flex-direction: row;
        align-items: center;
        height: 50px;
        padding: 0px 20px 0px 20px;
        margin-bottom: 10px;
        background-color: var(--bg-medium);
        font-size: 1.1rem;
        cursor: pointer;
    }

    .activeWrapper {
        height: 50px;
        background-color: var(--bg-bright);
        font-size: 1.4rem;
    }

    .main {
        display: flex;
        flex-direction: row;
        align-items: center;
        height: 40px;
    }

    .icon {
        margin-right: 7px;
        padding-top: 2px;
    }

    .comment {
        margin-left: auto;
        font-size: 0.9rem;
        color: var(--font-light);
    }
</style>
