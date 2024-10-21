<script lang="ts" context="module">
    export type Category = {
        name: string;
        subcategories: Category[] | undefined;
        elements: GlobalReference[];
    };
</script>

<script lang="ts">
    import Accordion from '$/src/components/ui/accordion/accordion.svelte';

    import type { GlobalReference } from '$global';

    export let category: Category;
</script>

{#if !category.subcategories}
    {#each category.elements as element}
        <span>{element.parent + '.' + element.name}</span>
    {/each}
{:else}
    <div class="pl-3">
        {#each category.subcategories as subcategory}
            <Accordion withIcon={false} name={subcategory.name}>
                <div class="flex flex-col gap-2 py-2 pl-12">
                    <svelte:self category={subcategory} />
                </div>
            </Accordion>
        {/each}
    </div>
{/if}
