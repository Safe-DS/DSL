<script lang="ts">
    import * as extensionApi from '../Apis/extensionApi';
</script>

<button
    on:click={() => {
        extensionApi.createInfoToast('Hello test');
    }}>Click me</button
>
