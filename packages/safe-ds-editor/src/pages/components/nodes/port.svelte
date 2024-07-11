<script lang="ts">
    import { cn } from '../../utils';
    import { Handle, Position } from '@xyflow/svelte';

    export let nameNode: string;
    export let namePort: string = 'default';
    export let type: 'target' | 'source' | 'both';
    export let optional: boolean = false;
    export let margin: 2 | 2.5 = 2;

    function getClass(
        type: 'target' | 'source',
        optional: boolean,
        margin: 2 | 2.5,
    ): string {
        let baseClass = 'absolute w-2.5 h-2.5';
        let positionClass = '';
        let optionalClass = optional
            ? ' ring-node_main ring-[2px] ring-inset'
            : '';
        if (type === 'target') {
            switch (margin) {
                case 2:
                    positionClass = 'left-0 -ml-2';
                    break;
                case 2.5:
                    positionClass = 'left-0 -ml-2.5';
                    break;
            }
        } else if (type === 'source') {
            switch (margin) {
                case 2:
                    positionClass = 'right-0 -mr-2';
                    break;
                case 2.5:
                    positionClass = 'right-0 -mr-2.5';
                    break;
            }
        }

        return cn(baseClass, positionClass, optionalClass);
    }
</script>

{#if type === 'both'}
    <Handle
        class={getClass('target', optional, margin)}
        id={`${nameNode}|groupTarget`}
        type="target"
        position={Position.Left}
    />
    <Handle
        class={getClass('source', optional, margin)}
        id={`${nameNode}|groupSource`}
        type="source"
        position={Position.Right}
    />
{:else}
    <Handle
        class={getClass(type, optional, margin)}
        id={`${nameNode}|${namePort}`}
        {type}
        position={type == 'target' ? Position.Left : Position.Right}
    />
{/if}
