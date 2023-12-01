<script lang="ts">
    import Debugger from './components/Debugger.svelte';
    import TableView from './components/TableView.svelte';
    import Sidebar from './components/Sidebar.svelte';
</script>

<main>
    <!-- <Debugger /> -->
    <!-- <hr /> -->
    <Sidebar />
    <TableView />
</main>

<style>
    main {
        display: flex;
        flex-direction: row;
        height: 100vh;
    }
</style>
