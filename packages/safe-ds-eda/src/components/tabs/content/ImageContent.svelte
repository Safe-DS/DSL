<script lang="ts">
    import type { Base64Image } from '../../../../types/state';

    export let image: Base64Image;
</script>

<div class="wrapper">
    <img class="tabImage" src={'data:image/' + image.format + ';base64,' + image.bytes} alt="profiling plot" />
</div>

<style>
    .wrapper {
        height: 100%;
        width: 100%;
        min-width: 700px;
        max-width: 800px;
        margin: 0 auto;
    }

    img {
        width: 100%;
        height: 100%;
        object-position: left;
    }
</style>
