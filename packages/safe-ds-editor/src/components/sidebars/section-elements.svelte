<script lang="ts">
    import { cn } from '$src/pages/utils';
    import { Input } from '$src/components/ui/input';
    import type { ClassValue } from 'clsx';

    export let className: ClassValue;
    export { className as class };
</script>

<div class={cn('flex flex-row gap-1 pt-3', className)}>
    <div class="bg-menu-400 flex-grow justify-center rounded-sm p-1 py-3 text-center shadow">
        Placeholder
    </div>
    <div class="bg-menu-400 flex-grow justify-center rounded-sm p-1 py-3 text-center shadow">
        Expression
    </div>
</div>
<Input placeholder="Search..." class="shadow" />
