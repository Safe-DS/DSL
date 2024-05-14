<script lang="ts">
    import CaretIcon from '../../icons/Caret.svelte';
    import { preventClicks } from '../../webviewState';

    export let selectedOption: string;
    export let possibleOptions: string[];
    export let fontSize: string = '1.4em';
    export let height: string = '45px';
    export let width: string = '160px';
    export let changesDisabled: boolean = false;
    export let error: boolean = false;
    export let onSelect: (selected: string) => void; // Function prop to notify parent of changes

    let isDropdownOpen = false;
    let dropdownRef: HTMLElement;

    const toggleDropdown = function () {
        if (changesDisabled || $preventClicks) return;

        isDropdownOpen = !isDropdownOpen;

        if (isDropdownOpen) {
            document.addEventListener('click', handleClickOutside);
        } else {
            document.removeEventListener('click', handleClickOutside);
        }
    };

    const handleClickOutside = function (event: MouseEvent) {
        if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
            isDropdownOpen = false;
            document.removeEventListener('click', handleClickOutside);
        }
    };

    const selectOption = function (option: string) {
        isDropdownOpen = false;
        document.removeEventListener('click', handleClickOutside);
        onSelect(option);
    };
</script>

<div
    bind:this={dropdownRef}
    class="wrapperDropdownButton"
    class:disabledWrapper={changesDisabled}
    style="font-size: {fontSize}; width: {width}; height: {height};"
>
    <div
        role="none"
        class="dropdownButton"
        class:dropdownButtonActive={isDropdownOpen}
        class:disabledButton={changesDisabled}
        on:click={toggleDropdown}
    >
        <div class="buttonText" class:error>
            {selectedOption}
        </div>
        <div class="icon">
            <CaretIcon color="var(--bg-bright)" />
        </div>
    </div>

    {#if isDropdownOpen}
        <ul class="dropdownMenu" style:width style:top={height}>
            {#each possibleOptions as option}
                {#if option !== selectedOption}
                    <li role="none" class="dropdownItem" on:click={() => selectOption(option)}>{option}</li>
                {/if}
            {/each}
        </ul>
    {/if}
</div>

<style>
    .wrapperDropdownButton {
        position: relative;
        display: inline-block;
        z-index: 1;
    }

    .disabledWrapper {
        filter: opacity(0.5);
    }

    .dropdownButton {
        display: inline-flex;
        align-items: center;
        padding: 0px 0px 0px 15px;
        border-radius: 5px;
        background-color: var(--bg-dark);
        height: 100%;
        width: 100%;
        cursor: pointer;
        user-select: none;
        justify-content: space-between;
    }

    .disabledButton {
        cursor: not-allowed;
    }

    .dropdownButton .buttonText {
        color: var(--font-dark);
        font-size: inherit;
        font-family: sans-serif;
        text-overflow: ellipsis;
        flex-grow: 1;
        flex-shrink: 1;
        flex-basis: auto;
        white-space: nowrap;
        overflow: hidden;
    }

    .dropdownButton .icon {
        width: 30px;
        height: 100%;
        display: inline-block;
        border-radius: 5px 0px 0px 5px;
        background-color: var(--bg-most-dark);
        transform: rotate(180deg);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: 10px;
        flex: 0 0 30px;
    }

    .dropdownButtonActive {
        border-radius: 5px 5px 5px 0px;
    }

    .dropdownButtonActive .icon {
        transform: rotate(0deg);
        border-radius: 0px 0px 0px 5px;
    }

    .dropdownButton:hover {
        background-color: #e0e0e0;
    }

    .disabledButton:hover {
        background-color: var(--bg-dark) !important;
    }

    .dropdownMenu {
        position: absolute; /* Positioning the dropdown near the button */
        background-color: var(--bg-dark);
        border-radius: 0px 0px 5px 5px;
        list-style: none;
        padding: 0;
        max-height: 400px;
        overflow-y: auto;
        overflow-x: hidden;
    }

    .dropdownItem {
        padding: 10px 15px;
        color: var(--font-dark);
        cursor: pointer;
        font-size: 16px;
        font-family: sans-serif;
        font-size: inherit;
        width: 100%;
    }

    .dropdownItem:hover {
        background-color: #e0e0e0;
    }

    .error {
        color: var(--error-color) !important;
    }
</style>
