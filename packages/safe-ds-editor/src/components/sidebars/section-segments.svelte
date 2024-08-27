<script lang="ts">
    import MenuIcon from '$src/assets/menu/menuIcon.svelte';
    import type { ClassValue } from 'clsx';
    import { Button } from '../ui/button';
    import * as Card from '../ui/card';
    import { cn } from '$src/pages/utils';

    export let className: ClassValue;
    export { className as class };
</script>

<div class={cn('grid gap-2 pl-3', className)}>
    <Button class="bg-menu-500 text-text-normal hover:bg-menu-400 w-full rounded-lg border"
        >+</Button
    >
    <Card.Root>
        <Card.Header>
            <Card.Title>textSegment</Card.Title>
        </Card.Header>
        <Card.Content class="text-text-muted">Segment Documentation can go here.</Card.Content>
        <Card.Footer>
            <div class="flex w-full flex-row gap-2">
                <Button class="bg-menu-700 text-text-normal hover:bg-menu-700/90 flex-grow shadow"
                    >Open</Button
                >
                <Button variant="destructive">
                    <MenuIcon name={'delete'} className={'h-7 w-7 stroke-text-normal p-1'} />
                </Button>
            </div>
        </Card.Footer>
    </Card.Root>
    <Card.Root>
        <Card.Header>
            <Card.Title>AnotherSegment</Card.Title>
        </Card.Header>
        <Card.Content class="text-text-muted">Segment Documentation can go here.</Card.Content>
        <Card.Footer>
            <div class="flex w-full flex-row gap-2">
                <Button class="bg-menu-700 text-text-normal hover:bg-menu-700/90 flex-grow shadow"
                    >Open</Button
                >
                <Button variant="destructive">
                    <MenuIcon name={'delete'} className={'h-7 w-7 stroke-text-normal py-1'} />
                </Button>
            </div>
        </Card.Footer>
    </Card.Root>
</div>
