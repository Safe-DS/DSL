<script context="module" lang="ts">
    export type Status = 'done' | 'processing' | 'waiting' | 'none';
</script>

<script lang="ts">
    import { cn } from '$/src/pages/utils';
    import type { ClassValue } from 'clsx';

    export let className: ClassValue;
    export { className as class };
    export let status;
    export let direction: 'horizontal' | 'vertical' = 'horizontal';

    $: loadingAnimationClass =
        direction === 'vertical' ? 'loading-animation-v' : 'loading-animation-h';
</script>

<div
    data-status={status}
    class={cn(
        'relative overflow-hidden',
        [
            'data-[status=done]:bg-green-400',
            'data-[status=none]:bg-neutral-400',
            'data-[status=waiting]:bg-yellow-500',
            `${status === 'processing' ? loadingAnimationClass : ''} data-[status=processing]:bg-menu-700`,
        ],
        className,
    )}
>
    <slot />
</div>

<style>
    /* Define the keyframes for the loading animation */
    @keyframes loadingAnimationH {
        0% {
            background-position: 0 0;
        }
        100% {
            background-position: 100px 0;
        }
    }

    @keyframes loadingAnimationV {
        0% {
            background-position: 0 100px;
        }
        100% {
            background-position: 0 0;
        }
    }

    /* Create a CSS class for the loading animation */
    .loading-animation-h {
        background-image: linear-gradient(
            to right,
            rgba(255, 255, 255, 0.4) 25%,
            rgb(234 179 8) 25%,
            rgb(234 179 8) 50%,
            rgba(255, 255, 255, 0.4) 50%,
            rgba(255, 255, 255, 0.4) 75%,
            rgb(234 179 8) 75%
        );
        background-size: 200px 4px;
        animation: loadingAnimationH 1s linear infinite;
    }

    .loading-animation-v {
        background-image: linear-gradient(
            to top,
            rgba(255, 255, 255, 0.4) 25%,
            rgb(234 179 8) 25%,
            rgb(234 179 8) 50%,
            rgba(255, 255, 255, 0.4) 50%,
            rgba(255, 255, 255, 0.4) 75%,
            rgb(234 179 8) 75%
        );
        background-size: 4px 200px;
        animation: loadingAnimationV 1s linear infinite;
    }

    /* Optional: Smooth transition when changing status */
    div[data-status] {
        transition: background 0.3s ease;
    }
</style>
