<script lang="ts">
    import { cn } from '$pages/utils';
    import type { ClassValue } from 'clsx';
    import type { GlobalReference, Segment } from '$global';
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
    export let globalReferences: Writable<GlobalReference[]>;
    export let selectedNodeList: XYNode[];

    let paneElements = false;
    let paneSegments = true;
    let paneParameters = false;
    let paneDocumentation = false;

    const dispatch = createEventDispatcher();

    const LORE =
        'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.';
</script>

<div class={cn('h-full w-full', className)}>
    <Resizable.PaneGroup class="h-full w-full" direction="vertical">
        <SidebarSection
            name={'Elemente'}
            order={0}
            bind:showPane={paneElements}
            showResizeHandle={paneSegments || paneDocumentation || paneParameters}
        >
            <SectionElements {globalReferences} />
        </SidebarSection>
        <SidebarSection
            name={'Segmente'}
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
            name={'Parameter'}
            order={2}
            bind:showPane={paneParameters}
            showResizeHandle={paneDocumentation}
        >
            <SectionParameter {selectedNodeList} />
        </SidebarSection>
        <SidebarSection
            name={'Dokumentation'}
            order={3}
            bind:showPane={paneDocumentation}
            showResizeHandle={false}
        >
            <SectionDocumentation {selectedNodeList} />
        </SidebarSection>
    </Resizable.PaneGroup>
</div>
