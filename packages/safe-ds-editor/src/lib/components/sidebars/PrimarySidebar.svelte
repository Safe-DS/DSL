<script lang="ts">
    import resize from '$lib/traits/resizable';
    import * as Accordion from '$lib/components/ui/accordion';
    import { cn } from '$lib/utils';
    import type { ClassValue } from 'clsx';

    export let className: ClassValue;
    export { className as class };
    export let categories: Category[];
</script>

<div class={cn('h-full', className)}>
    <div
        class="relative z-10 h-full w-[270px]"
        use:resize={{ sides: ['right'] }}
    >
        <div
            class=" bg-vscode_sidebar_background flex h-full w-full flex-col gap-2 overflow-hidden"
        >
            <h2 class=" p-2 text-2xl font-bold">Functions</h2>
            <Accordion.Root multiple={true}>
                {#each categories as category, index}
                    <Accordion.Item value={index.toString()}>
                        <Accordion.Trigger
                            class="text-vscode_foreground hover:bg-vscode_sidebar_hover gap-2 whitespace-nowrap pl-4 text-base font-bold hover:no-underline"
                        >
                            <svelte:component
                                this={category.icon}
                                className="h-5 w-5 flex-shrink-0 stroke-vscode_foreground"
                            />
                            {category.name}
                        </Accordion.Trigger>
                        <Accordion.Content
                            class=" text-vscode_foreground py-2 pl-8"
                        >
                            Not sure what comes here yet.<br />
                            Not sure what comes here yet.<br />
                            Not sure what comes here yet.<br />
                            Not sure what comes here yet.<br />
                            Not sure what comes here yet.<br />
                            Not sure what comes here yet.<br />
                            Not sure what comes here yet.<br />
                            Not sure what comes here yet.<br />
                        </Accordion.Content>
                    </Accordion.Item>
                {/each}
            </Accordion.Root>
        </div>
    </div>
</div>
