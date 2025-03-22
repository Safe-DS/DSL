import type { Category } from '$/src/components/ui/category/category-tree-node.svelte';

export const countChildren = (category: Category): number => {
    if (category.subcategories) {
        return category.subcategories.map(countChildren).reduce((sum, count) => sum + count, 0);
    }
    return category.elements.length;
};

export const renderCategoryName = (category: Category): string => {
    return category.name + ' (' + countChildren(category) + ')';
};
