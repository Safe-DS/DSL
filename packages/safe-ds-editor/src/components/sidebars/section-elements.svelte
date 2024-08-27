<script lang="ts">
    import { cn } from '$src/pages/utils';
    import { Input } from '$src/components/ui/input';
    import type { ClassValue } from 'clsx';
    import type { Writable } from 'svelte/store';
    import type { GlobalReference } from '$global';
    import { ScrollArea } from '../ui/scroll-area';
    import Accordion from '../ui/accordion/accordion.svelte';
    import { isEmpty } from '../../../../safe-ds-lang/src/helpers/collections';
    import CategoryIcon from '$src/assets/category/categoryIcon.svelte';

    export let globalReferences: Writable<GlobalReference[]>;
    export let className: ClassValue;
    export { className as class };

    let searchValue: string;

    const customCategoryOrder = [
        'DataImport',
        'DataExport',
        'DataExploration',
        'DataProcessing',
        'Modeling',
        'ModelEvaluation',
    ];
    const customSort = ([a]: [string, GlobalReference[]], [b]: [string, GlobalReference[]]) => {
        const indexA = customCategoryOrder.indexOf(a);
        const indexB = customCategoryOrder.indexOf(b);
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    };

    $: categories = Array.from(
        $globalReferences
            .filter((ref) => {
                if (!searchValue) return true;
                return `${ref.parent}.${ref.name}`
                    .toLowerCase()
                    .includes(searchValue.toLowerCase());
            })
            .reduce((map, ref) => {
                if (!map.has(ref.category)) {
                    map.set(ref.category, []);
                }
                map.get(ref.category)!.push(ref);
                return map;
            }, new Map<string, GlobalReference[]>())
            .entries(),
    ).sort(customSort);
</script>

<div class={cn('flex flex-col gap-2', className)}>
    <div class="flex flex-row gap-1 px-3">
        <div
            class="bg-menu-400 flex-grow cursor-grab justify-center rounded-sm p-1 py-3 text-center shadow"
        >
            Placeholder
        </div>
        <div
            class="bg-menu-400 flex-grow cursor-grab justify-center rounded-sm p-1 py-3 text-center shadow"
        >
            Expression
        </div>
    </div>
    <div class="mx-3"><Input placeholder="Search..." bind:value={searchValue} /></div>
    <ScrollArea>
        {#each categories as [categoryName, references] (categoryName)}
            <Accordion class="pl-3" name={categoryName ? categoryName : 'Undefined'}>
                <CategoryIcon
                    slot="icon"
                    name={categoryName}
                    className="mr-2 overflow-hidden stroke-text-normal "
                />

                <div class="flex flex-col gap-2 py-2 pl-12">
                    {#each references as reference}
                        <span>{reference.parent + '.' + reference.name}</span>
                    {/each}
                </div>
            </Accordion>
        {/each}
    </ScrollArea>
</div>
