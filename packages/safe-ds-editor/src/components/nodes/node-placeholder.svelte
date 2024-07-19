<script context="module" lang="ts">
    export type PlaceholderProps = { placeholder: Placeholder };
</script>

<script lang="ts">
    import tooltip from '$src/traits/tooltip';
    import { Handle, Position, type NodeProps } from '@xyflow/svelte';
    import statusIndicator from '$src/traits/status-indicator';
    import { Placeholder } from '$global';
    import DataTypeIcon from '$/src/assets/dataType/dataTypeIcon.svelte';

    type $$Props = NodeProps;
    export let data: $$Props['data'];
    const { placeholder } = data as PlaceholderProps;
    let isHovered = false;
</script>

<div
    role="group"
    use:tooltip={{ content: placeholder.name, delay: 150 }}
    class="w-24 cursor-default"
    on:mouseover={() => (isHovered = true)}
    on:mouseout={() => (isHovered = false)}
    on:focus={() => {}}
    on:blur={() => {}}
>
    <span
        class="text-text-normal relative -left-6 block w-[120px] {isHovered
            ? ''
            : 'truncate'} text-center text-xl font-bold">{placeholder.name}</span
    >
    <div
        use:statusIndicator={{ status: 'done' }}
        class=" rounded-placeholderFrame shadow-node justify-center py-1"
    >
        <div class="rounded-placeholderCore bg-node-normal relative">
            <DataTypeIcon name={placeholder.type} className={'h-20 w-24 stroke-text-normal p-1'} />
            <Handle
                type="target"
                id="target"
                position={Position.Left}
                class=" absolute -ml-2.5 h-3 w-3"
            />
            <Handle
                type="source"
                id="source"
                position={Position.Right}
                class=" absolute -mr-2.5 h-3 w-3"
            />
        </div>
    </div>
</div>
