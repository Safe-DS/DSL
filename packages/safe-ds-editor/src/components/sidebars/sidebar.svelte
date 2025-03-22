<script lang="ts">
    import { cn } from '$pages/utils';
    import type { ClassValue } from 'clsx';
    import { Buildin, Segment } from '$global';
    import type { Writable } from 'svelte/store';
    import * as Resizable from '$src/components/ui/resizable';
    import { type Node as XYNode } from '@xyflow/svelte';
    import SidebarSection from '$/src/components/sidebars/sidebar-section.svelte';
    import SectionElements from './section-elements.svelte';
    import SectionSegments from './section-segments.svelte';
    import SectionDocumentation from './section-documentation.svelte';
    import SectionParameter from './section-parameter.svelte';
    import { createEventDispatcher } from 'svelte';

    export let className: ClassValue;
    export { className as class };
    export let segmentList: Writable<Segment[]>;
    export let globalReferences: Writable<Buildin[]>;
    export let selectedNodeList: XYNode[];

    let paneElements = true;
    let paneSegments = false;
    let paneParameters = false;
    let paneDocumentation = false;

    const dispatch = createEventDispatcher();
</script>

<div class={cn('h-full w-full', className)}>
    <Resizable.PaneGroup class="h-full w-full" direction="vertical">
        <SidebarSection
            name={'Elements'}
            order={0}
            bind:showPane={paneElements}
            showResizeHandle={paneSegments || paneDocumentation || paneParameters}
        >
            <SectionElements {globalReferences} {selectedNodeList} />
        </SidebarSection>
        <SidebarSection
            name={'Segments'}
            order={1}
            bind:showPane={paneSegments}
            showResizeHandle={paneDocumentation || paneParameters}
        >
            <SectionSegments
                {segmentList}
                on:editSegment={(event) => {
                    dispatch('editSegment', event.detail);
                }}
            />
        </SidebarSection>
        <SidebarSection
            name={'Parameters'}
            order={2}
            bind:showPane={paneParameters}
            showResizeHandle={paneDocumentation}
        >
            <SectionParameter {selectedNodeList} />
        </SidebarSection>
        <SidebarSection name={'Documentation'} order={3} bind:showPane={paneDocumentation} showResizeHandle={false}>
            <SectionDocumentation {selectedNodeList} />
        </SidebarSection>
    </Resizable.PaneGroup>
</div>
