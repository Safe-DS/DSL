<script lang="ts">
    import resize from '$src/traits/resizable';
    import * as Accordion from '$src/components/ui/accordion';
    import * as Tabs from '$src/components/ui/tabs';
    import * as Card from '$src/components/ui/card';
    import * as Button from '$src/components/ui/button';
    import { cn } from '$pages/utils';
    import type { ClassValue } from 'clsx';
    import { Input } from '$src/components/ui/input';
    import MenuIcon from '$assets/menu/menuIcon.svelte';
    import { functions } from '$/src/dummyData/functions';

    export let className: ClassValue;
    export { className as class };
</script>

<div class={cn('h-full', className)}>
    <div class="relative z-10 h-full w-[270px]" use:resize={{ sides: ['right'] }}>
        <div class=" bg-menu-500 flex h-full w-full flex-col gap-3 overflow-hidden px-2">
            <!-- <h2 class="text-text-normal text-2xl font-bold">Functions</h2> -->

            <Tabs.Root value="nodes" class="w-full">
                <Tabs.List class="w-full">
                    <Tabs.Trigger value="nodes" class="flex-1 basis-1/2">Nodes</Tabs.Trigger>
                    <Tabs.Trigger value="extension" class="flex-1 basis-1/2">Segments</Tabs.Trigger>
                </Tabs.List>
                <Tabs.Content value="nodes">
                    <div class="flex flex-col gap-3">
                        <Input placeholder="Search..." class="shadow" />
                        <div class="flex flex-row gap-1">
                            <div
                                class="bg-menu-400 flex-grow justify-center rounded-sm p-1 py-3 text-center shadow"
                            >
                                Placeholder
                            </div>
                            <div
                                class="bg-menu-400 flex-grow justify-center rounded-sm p-1 py-3 text-center shadow"
                            >
                                Expression
                            </div>
                        </div>
                        <Accordion.Root multiple={true} class="grid gap-2">
                            {#each Object.keys(functions) as categoryName, index}
                                <Accordion.Item value={index.toString()}>
                                    <Accordion.Trigger
                                        class="text-text-normal hover:bg-menu-400 gap-2 whitespace-nowrap pl-2 text-base font-bold hover:no-underline"
                                    >
                                        <!-- <svelte:component
                                            this={category.icon}
                                            className="h-5 w-5 flex-shrink-0 stroke-text-normal"
                                        /> -->
                                        {categoryName}
                                        <span class="text-text-muted text-xs">(3)</span>
                                    </Accordion.Trigger>
                                    <Accordion.Content class=" text-text-normal py-2 pl-8">
                                        {#each functions[categoryName] as functionName}
                                            {functionName}<br />
                                        {/each}
                                    </Accordion.Content>
                                </Accordion.Item>
                            {/each}
                        </Accordion.Root>
                    </div>
                </Tabs.Content>
                <Tabs.Content value="extension">
                    <div class="grid gap-2">
                        <Button.Button
                            class="bg-menu-500 text-text-normal hover:bg-menu-400 w-full rounded-lg border"
                            >+</Button.Button
                        >
                        <Card.Root>
                            <Card.Header>
                                <Card.Title>textSegment</Card.Title>
                            </Card.Header>
                            <Card.Content class="text-text-muted">
                                Segment Documentation can go here.
                            </Card.Content>
                            <Card.Footer>
                                <div class="flex w-full flex-row gap-2">
                                    <Button.Button
                                        class="bg-menu-700 text-text-normal hover:bg-menu-700/90 flex-grow shadow"
                                        >Open</Button.Button
                                    >
                                    <Button.Button variant="destructive">
                                        <MenuIcon
                                            name={'delete'}
                                            className={'h-7 w-7 stroke-text-normal p-1'}
                                        />
                                    </Button.Button>
                                </div>
                            </Card.Footer>
                        </Card.Root>
                        <Card.Root>
                            <Card.Header>
                                <Card.Title>AnotherSegment</Card.Title>
                            </Card.Header>
                            <Card.Content class="text-text-muted">
                                Segment Documentation can go here.
                            </Card.Content>
                            <Card.Footer>
                                <div class="flex w-full flex-row gap-2">
                                    <Button.Button
                                        class="bg-menu-700 text-text-normal hover:bg-menu-700/90 flex-grow shadow"
                                        >Open</Button.Button
                                    >
                                    <Button.Button variant="destructive">
                                        <MenuIcon
                                            name={'delete'}
                                            className={'h-7 w-7 stroke-text-normal py-1'}
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
