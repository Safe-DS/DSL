<script lang="ts">
    import type { CustomError } from '$global';
    import { ScrollArea } from '$src/components/ui/scroll-area';
    export let errorList: CustomError[];
</script>

<div class=" flex h-full w-full flex-col items-center justify-center gap-4">
    <span class="text-xs text-red-600">Critical Error</span>
    <ScrollArea class="h-3/4 w-3/4 rounded-md border-2 border-red-600 p-6">
        <div class="flex select-text flex-col gap-2">
            {#each errorList as error}
                <div
                    class="select-text whitespace-pre-wrap text-xl font-bold text-red-600"
                >
                    {'AstParser'}
                </div>
                <div
                    class="select-text whitespace-pre-wrap text-sm text-gray-300"
                >
                    {error.message}
                </div>
            {/each}
        </div>
    </ScrollArea>
    <button
        class=" w-20"
        on:click={() => {
            errorList = [];
        }}>Continue</button
    >
</div>
