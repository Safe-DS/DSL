<script lang="ts">
    import CaretIcon from '../../icons/Caret.svelte';
    import { preventClicks } from '../../webviewState';

    export let selectedOption: string;
    export let possibleOptions: { name: string; color?: string; comment?: string }[];
    export let fontSize: string = '1.4em';
    export let height: string = '45px';
    export let width: string = '160px';
    export let changesDisabled: boolean = false;
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
    style="font-size: {fontSize}; width: {width}; height: {height}; min-height: 40px;"
>
    <div
        role="none"
        class="dropdownButton"
        class:dropdownButtonActive={isDropdownOpen}
        class:disabledButton={changesDisabled}
        on:click={toggleDropdown}
    >
        <div class="buttonText" style:color={possibleOptions.find((o) => o.name === selectedOption)?.color}>
            <span>{selectedOption}</span>
            {#if possibleOptions.find((o) => o.name === selectedOption)?.comment}
                <span class="itemComment">{possibleOptions.find((o) => o.name === selectedOption)?.comment}</span>
            {/if}
        </div>
        <div class="icon">
            <CaretIcon color="var(--lightest-color)" />
        </div>
    </div>

    {#if isDropdownOpen}
        <ul class="dropdownMenu" style="width: {width}; top: calc(max(40px, {height}));">
            {#each possibleOptions as option}
                {#if option.name !== selectedOption}
                    <li
                        role="none"
                        class="dropdownItem"
                        on:click={() => selectOption(option.name)}
                        style:color={option.color}
                    >
                        <span>{option.name}</span>
                        {#if option.comment}
                            <span class="itemComment">{option.comment}</span>
                        {/if}
                    </li>
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
        background-color: var(--medium-light-color);
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
        color: var(--darkest-color);
        font-size: inherit;
        font-family: sans-serif;
        text-overflow: ellipsis;
        flex-grow: 1;
        flex-shrink: 1;
        flex-basis: auto;
        white-space: nowrap;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
    }

    .buttonText * {
        color: inherit;
    }

    .dropdownButton .icon {
        width: 30px;
        height: 100%;
        display: inline-block;
        border-radius: 5px 0px 0px 5px;
        background-color: var(--medium-color);
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
        background-color: var(--medium-light-color) !important;
    }

    .dropdownMenu {
        position: absolute; /* Positioning the dropdown near the button */
        background-color: var(--medium-light-color);
        border-radius: 0px 0px 5px 5px;
        list-style: none;
        padding: 0;
        max-height: 400px;
        overflow-y: auto;
        overflow-x: hidden;
    }

    .dropdownItem {
        padding: 10px 15px;
        color: var(--darkest-color);
        cursor: pointer;
        font-size: 16px;
        font-family: sans-serif;
        font-size: inherit;
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
    }

    .dropdownItem * {
        color: inherit;
    }

    .itemComment {
        font-size: 0.7em;
        color: var(--dark-color);
    }

    .dropdownItem:hover {
        background-color: #e0e0e0;
    }
</style>
