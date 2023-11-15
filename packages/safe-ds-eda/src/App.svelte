<script lang="ts">
  import Child from "./components/Child.svelte";
  import ServerCaller from "./components/ServerCaller.svelte";
  import TableView from "./components/TableView.svelte";
  import { currentState, allStates } from "./webviewState";

  function resetAllState() {
    allStates.set([]);
    currentState.set({ selectedText: undefined, randomText: "" });
  }
</script>

<main>
  <h1>{$currentState.selectedText ?? "Select Table"}</h1>
  <button
    on:click={() => {
      $currentState.randomText = Math.ceil(Math.random() * 100).toString();
    }}>rdm state</button
  >
  <h1>{$currentState.randomText}</h1>
  <p>
    {JSON.stringify($allStates.filter((as) => as.selectedText !== $currentState.selectedText).concat([$currentState]))}
  </p>
  <button on:click={() => resetAllState()}>reset state</button>
  <hr />
  <TableView />
  <div class="rest">
    <hr />
    <ServerCaller />
    <hr />
    <Child />
  </div>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }
  .rest {
    margin-top: auto;
  }
</style>
