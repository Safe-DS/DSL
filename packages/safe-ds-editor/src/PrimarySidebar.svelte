<script>
    import { writable } from 'svelte/store';
  
    export let categories = [];
  
    const displayCategorySymbols = writable(true);
    const displayFunctionSymbols = writable(true);
  </script>
  

  <PrimarySidebar>
  <div
    class="content-box p-r-5 min-w-250"
  >
    <h2 class="mb-30">Funktionen</h2>
    <input
      type="text"
      placeholder="Search..."
      class="mb-20 w-full text-15"
    />
  
    {#each categories as category, index}
      <CategoryElement
        {category}
        {displayFunctionSymbols}
        {displayCategorySymbols}
      />
    {/each}
  
    <div class="flex flex-col mt-50">
      <label>
        <input
          type="checkbox"
          bind:checked={$displayCategorySymbols}
        />
        Display Category Labels
      </label>
      <label>
        <input
          type="checkbox"
          bind:checked={$displayFunctionSymbols}
        />
        Display Function Labels
      </label>
    </div>
  </div>
  
  <CategoryElement let:category let:displayFunctionSymbols let:displayCategorySymbols>
    <script>
      import { writable } from 'svelte/store';
      let { category, displayFunctionSymbols, displayCategorySymbols } = $$props;
      const expanded = writable(false);
      const toggleExpanded = () => expanded.update(n => !n);
      const categoryIcon = `../resources/categories/${category.fileName}`;
      const expandIcon = `../resources/menu/expand.svg`;
    </script>
  
    <div id="Category" class="mb-20">
      <div id="CategoryHeader" class="flex items-center mb-10 flex-grow">
        <button
          on:click={toggleExpanded}
          class="border-none bg-transparent"
        >
          <div class="{expanded ? 'rotate-90' : 'rotate-0'} transition-transform duration-300 flex">
            <img
              src={expandIcon}
              alt="Toggle Category"
              class="w-15 h-15"
            />
          </div>
        </button>
        <img
          src={categoryIcon}
          alt={category.name}
          class="mr-10 w-18 {displayCategorySymbols ? 'block' : 'hidden'}"
        />
        <span class="mr-10 flex-grow">{category.name}</span>
      </div>
      <div
        id="CategoryList"
        class="{expanded ? 'block' : 'hidden'} mb-10 ml-{displayCategorySymbols ? '55' : '37'}"
      >
        {['Sample Funktion A', 'Sample Funktion B', 'Sample Funktion C'].map((text, index) => (
          <div key={index} class="mt-5 flex items-center">
            <img
              src={categoryIcon}
              alt={category.name}
              class="mr-10 w-20 {displayFunctionSymbols ? 'block' : 'hidden'}"
            />
            <span>{text}</span>
          </div>
        ))}
      </div>
    </div>
  </CategoryElement>
  </PrimarySidebar>
  

  <style>
    /* Tailwind CSS classes will be used directly in the markup, so no additional CSS here. */
  </style>