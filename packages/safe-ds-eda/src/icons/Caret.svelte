<script lang="ts">
    export let color = 'var(--dark-color)';
    export let hoverColor = 'var(--dark-color)';
</script>

<svg
    class="icon"
    width="13"
    height="11"
    viewBox="0 0 5 4"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style="--color: {color}; --hover-color: {hoverColor};"
>
    <path d="M2.5 0.5L4.66506 3.5H0.334937L2.5 0.5Z" fill={color} />
</svg>

<style>
    .icon path {
        fill: var(--color);
    }
    .icon:hover path {
        fill: var(--hover-color);
    }
</style>
