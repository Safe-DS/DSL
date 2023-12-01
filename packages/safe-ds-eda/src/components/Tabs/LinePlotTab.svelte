<script lang="ts">
    import type { LinePlotTab } from '../../../../../types/shared-eda-vscode/types';
    import LinePlotIcon from '../../icons/line-plot.svelte';

    export let tabOject: LinePlotTab;
    export let active: boolean;
</script>

<div class="wrapper" class:activeWrapper={active}>
    <div class="main">
        <span class="icon"><LinePlotIcon /></span>
        <span class="title">Line Plot</span>
    </div>
    <span class="comment">{tabOject.tabComment}</span>
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
