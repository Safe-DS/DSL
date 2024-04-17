<script context="module" lang="ts">
    export type PlaceholderProps = { placeholder: Placeholder };
</script>

<script lang="ts">
    import tooltip from '$lib/traits/tooltip';

    import { type NodeProps } from '@xyflow/svelte';
    import Port from './port.svelte';
    import statusIndicator from '$lib/traits/status-indicator';

    type $$Props = NodeProps;

    export let data: { placeholder: Placeholder };
    const { placeholder } = data;
</script>

<div
    use:tooltip={{ content: placeholder.name, delay: 150 }}
    class="w-14 cursor-default"
>
    <span class="text-node_main_text relative -left-3 block w-20 truncate text-center text-sm"
        >{placeholder.name}</span
    >
    <div
        use:statusIndicator={{ status: placeholder.status }}
        class=" shadow-node rounded-placeholderFrame justify-center py-1"
    >
        <div class="bg-node_main rounded-placeholderCore relative">
            <svelte:component
                this={placeholder.type.icon}
                className="h-14 w-14 stroke-node_main_text p-1"
            />
            <Port nameNode={placeholder.name} type="both"></Port>
        </div>
    </div>
</div>
