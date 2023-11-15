<script lang="ts">
  import * as pythonApi from "../Apis/pythonApi";

  let pythonHtmlString = "";
  async function callPythonServer() {
    pythonHtmlString = await pythonApi.GetHtmlTable();
  }
</script>

<button
  on:click={() => {
    callPythonServer();
  }}>Call Python Mini Server</button
>
<p>{@html pythonHtmlString}</p>
