<script lang="ts">
    import resize from '$lib/traits/resizable';
    import * as Accordion from '$lib/components/ui/accordion';
    import * as Tabs from '$lib/components/ui/tabs';
    import * as Card from '$lib/components/ui/card';
    import * as Button from '$lib/components/ui/button';
    import { cn } from '$lib/utils';
    import type { ClassValue } from 'clsx';
    import { Input } from '../ui/input';
    import { menu } from 'src/assets/menu/menu';

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
            class=" bg-background_mid flex h-full w-full flex-col gap-3 overflow-hidden px-2"
        >
            <h2 class="text-text_main text-2xl font-bold">Functions</h2>

            <Tabs.Root value="nodes" class="w-full">
                <Tabs.List class="w-full">
                    <Tabs.Trigger value="nodes" class="flex-1 basis-1/2"
                        >Nodes</Tabs.Trigger
                    >
                    <Tabs.Trigger value="extension" class="flex-1 basis-1/2"
                        >Extensions</Tabs.Trigger
                    >
                </Tabs.List>
                <Tabs.Content value="nodes">
                    <div class="flex flex-col gap-3">
                        <Input placeholder="Search..." class="shadow" />
                        <div class="flex flex-row gap-1">
                            <div
                                class="bg-background_light flex-grow justify-center rounded-sm p-1 py-3 text-center shadow"
                            >
                                Placeholder
                            </div>
                            <div
                                class="bg-background_light flex-grow justify-center rounded-sm p-1 py-3 text-center shadow"
                            >
                                Expression
                            </div>
                        </div>
                        <Accordion.Root multiple={true} class="grid gap-2">
                            {#each categories as category, index}
                                <Accordion.Item value={index.toString()}>
                                    <Accordion.Trigger
                                        class="text-text_main hover:bg-background_light gap-2 whitespace-nowrap pl-2 text-base font-bold hover:no-underline"
                                    >
                                        <svelte:component
                                            this={category.icon}
                                            className="h-5 w-5 flex-shrink-0 stroke-text_main"
                                        />
                                        {category.name}
                                        <span
                                            class="text-text_secondary text-xs"
                                            >(3)</span
                                        >
                                    </Accordion.Trigger>
                                    <Accordion.Content
                                        class=" text-text_main py-2 pl-8"
                                    >
                                        Item 1<br />
                                        Item 2<br />
                                        Item 3<br />
                                    </Accordion.Content>
                                </Accordion.Item>
                            {/each}
                        </Accordion.Root>
                    </div>
                </Tabs.Content>
                <Tabs.Content value="extension">
                    <div class="grid gap-2">
                        <Button.Button
                            class="text-text_main bg-background_mid hover:bg-background_light w-full rounded-lg border"
                            >+</Button.Button
                        >
                        <Card.Root>
                            <Card.Header>
                                <Card.Title>textExtension</Card.Title>
                            </Card.Header>
                            <Card.Content class="text-text_secondary">
                                Extension Documentation can go here.
                            </Card.Content>
                            <Card.Footer>
                                <div class="flex w-full flex-row gap-2">
                                    <Button.Button
                                        class="bg-background_dark text-text_main hover:bg-background_dark/90 flex-grow shadow"
                                        >Open</Button.Button
                                    >
                                    <Button.Button variant="destructive">
                                        <svelte:component
                                            this={menu.delete}
                                            className="h-7 w-7 stroke-text_main p-1"
                                        />
                                    </Button.Button>
                                </div>
                            </Card.Footer>
                        </Card.Root>
                        <Card.Root>
                            <Card.Header>
                                <Card.Title>AnotherExtension</Card.Title>
                            </Card.Header>
                            <Card.Content class="text-text_secondary">
                                Extension Documentation can go here.
                            </Card.Content>
                            <Card.Footer>
                                <div class="flex w-full flex-row gap-2">
                                    <Button.Button
                                        class="bg-background_dark text-text_main hover:bg-background_dark/90 flex-grow shadow"
                                        >Open</Button.Button
                                    >
                                    <Button.Button variant="destructive">
                                        <svelte:component
                                            this={menu.delete}
                                            className="h-7 w-7 stroke-text_main py-1"
                                        />
                                    </Button.Button>
                                </div>
                            </Card.Footer>
                        </Card.Root>
                    </div>
                </Tabs.Content>
            </Tabs.Root>
        </div>
    </div>
</div>
