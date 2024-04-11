<script lang="ts">
    import { Handle, Position } from '@xyflow/svelte';

    export let nameNode: string;
    export let namePort: string = 'default';
    export let type: 'target' | 'source' | 'both';
    export let optional: boolean = false;

    function getClass(type: 'target' | 'source', optional: boolean): string {
        let className: string;
        switch (type) {
            case 'target':
                className = 'absolute left-0 -ml-2 w-2.5 h-2.5';
                break;
            case 'source':
                className = 'absolute right-0 -mr-2 w-2.5 h-2.5';
                break;
        }

        if (optional) {
            className += ' ring-node_main ring-[2px] ring-inset';
        }

        return className;
    }
</script>

{#if type === 'both'}
    <Handle
        class={getClass('target', optional)}
        id={`${nameNode}|groupTarget`}
        type="target"
        position={Position.Left}
    />
    <Handle
        class={getClass('source', optional)}
        id={`${nameNode}|groupSource`}
        type="source"
        position={Position.Right}
    />
{:else}
    <Handle
        class={getClass(type, optional)}
        id={`${nameNode}|${namePort}`}
        {type}
        position={type == 'target' ? Position.Left : Position.Right}
    />
{/if}
