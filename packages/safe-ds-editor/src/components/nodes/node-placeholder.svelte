<script context="module" lang="ts">
    export type PlaceholderProps = { placeholder: Placeholder };
</script>

<script lang="ts">
    import tooltip from '$src/traits/tooltip';
    import { type NodeProps } from '@xyflow/svelte';
    import Port from '$src/components/nodes/port.svelte';
    import statusIndicator from '$src/traits/status-indicator';
    import { Placeholder } from '$global';

    type $$Props = NodeProps;

    export let data: { placeholder: Placeholder };
    const { placeholder } = data;
</script>

<div
    use:tooltip={{ content: placeholder.name, delay: 150 }}
    class="w-14 cursor-default"
>
    <span
        class="text-text_main relative -left-3 block w-20 truncate text-center text-sm"
        >{placeholder.name}</span
    >
    <div
        use:statusIndicator={{ status: 'done' }}
        class=" rounded-placeholderFrame shadow-node justify-center py-1"
    >
        <div class="rounded-placeholderCore bg-node_main relative">
            <!-- {#if placeholder.type.icon}
                <svelte:component
                    this={placeholder.type.icon}
                    className="h-14 w-14 stroke-text_main p-1"
                />
            {:else} -->
            <div class="h-14 w-14"></div>
            <!-- {/if} -->
            <Port nameNode={placeholder.name} type="both"></Port>
        </div>
    </div>
</div>
