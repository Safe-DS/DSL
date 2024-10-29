<script lang="ts">
    import { cn } from '$src/pages/utils';
    import { Input } from '$src/components/ui/input';
    import type { ClassValue } from 'clsx';
    import type { Writable } from 'svelte/store';
    import type { GlobalReference } from '$global';
    import { ScrollArea } from '$src/components/ui/scroll-area';
    import Accordion from '$src/components/ui/accordion/accordion.svelte';
    import { type Node as XYNode } from '@xyflow/svelte';
    import CategoryIcon from '$src/assets/category/categoryIcon.svelte';
    import { getTypeName } from '$/src/components/sidebars/utils';
    import { Switch } from '$/src/components/ui/switch';
    import type { Category } from '$/src/components/ui/category/category-tree-node.svelte';
    import CategoryTreeNode from '$/src/components/ui/category/category-tree-node.svelte';

    export let globalReferences: Writable<GlobalReference[]>;
    export let className: ClassValue;
    export { className as class };
    export let selectedNodeList: XYNode[];

    $: typeName = getTypeName(selectedNodeList);

    let searchValue: string;
    let contextual: boolean = false;

    const customCategoryOrder = [
        'BasicElement',
        'DataImport',
        'DataExport',
        'DataExploration',
        'DataProcessing',
        'Modeling',
        'ModelEvaluation',
        'Utilities',
    ];
    const customSort = (a: Category, b: Category) => {
        const indexA = customCategoryOrder.indexOf(a.name);
        const indexB = customCategoryOrder.indexOf(b.name);
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    };

    $: categories = Array.from(
        $globalReferences.reduce((categories, ref) => {
            const categoryPath = ref.category ? ref.category.split('Q') : ['NotYetCategorized'];

            const insertRef = (path: string[], categories: Category[]) => {
                const match = categories.find((c) => c.name === path[0]);
                const last = path.length === 1;
                const filtered =
                    (contextual &&
                        typeName &&
                        ref.parent?.toLowerCase() !== typeName?.toLowerCase()) ||
                    (searchValue &&
                        !`${ref.parent}.${ref.name}`
                            .toLowerCase()
                            .includes(searchValue.toLowerCase()));

                if (match && last) {
                    if (!filtered) match.elements.push(ref);
                    else match.filteredCount += 1;
                    return;
                }
                if (match && !last) {
                    if (!match.subcategories) match.subcategories = [];
                    insertRef(path.slice(1), match.subcategories);
                }
                if (!match && last) {
                    const newCategory: Category = {
                        name: path[0],
                        subcategories: undefined,
                        filteredCount: !filtered ? 0 : 1,
                        elements: !filtered ? [ref] : [],
                    };
                    categories.push(newCategory);
                    return;
                }
                if (!match && !last) {
                    const newCategory: Category = {
                        name: path[0],
                        subcategories: [],
                        filteredCount: 0,
                        elements: [],
                    };
                    categories.push(newCategory);
                    insertRef(path.slice(1), newCategory.subcategories!);
                }
            };
            insertRef(categoryPath, categories);

            return categories;
        }, [] as Category[]),
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
            GenericExpression
        </div>
    </div>
    <div class=" mx-3 border-none">
        <Input placeholder="Search..." bind:value={searchValue} />
    </div>
    <div class=" mx-4 flex flex-row items-center gap-2 text-sm">
        <Switch
            onCheckedChange={(value) => {
                contextual = value;
            }}
            class="data-[state=unchecked]:bg-menu-300 data-[state=checked]:bg-menu-300"
        />
        <p data-state={contextual ? 'on' : 'off'} class=" data-[state=off]:text-text-muted">
            Contextual
        </p>
    </div>
    <ScrollArea>
        {#each categories as category}
            <Accordion class="pl-3" name={category.name}>
                <CategoryIcon
                    slot="icon"
                    name={category.name}
                    className="mr-2 overflow-hidden stroke-text-normal "
                />

                <div class="flex flex-col gap-2 py-2 pl-12">
                    <CategoryTreeNode {category} />
                </div>
            </Accordion>
        {/each}
    </ScrollArea>
</div>
