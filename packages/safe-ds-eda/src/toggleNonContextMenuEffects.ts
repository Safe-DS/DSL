const originalHoverStyles = new Map<CSSStyleRule, string>();
const originalCursorStyles = new Map<CSSStyleRule, string>();

export const disableNonContextMenuEffects = function () {
    const stylesheets = document.styleSheets;

    for (let i = 0; i < stylesheets.length; i++) {
        const rules = stylesheets[i].cssRules;
        const ownerNode = stylesheets[i].ownerNode;
        if (
            !(ownerNode instanceof Element) ||
            (ownerNode instanceof Element && ownerNode.id && !ownerNode.id.includes('svelte'))
        ) {
            // We only care for stylesheets that are svlete generated
            continue;
        }

        for (let j = 0; j < rules.length; j++) {
            // Remove all hover styles and cursor pointer styles from non context menu elements
            const rule = rules[j] as CSSStyleRule;
            if (rule.selectorText?.includes(':hover') && !rule.selectorText?.includes('contextMenu')) {
                // Store the original hover style
                originalHoverStyles.set(rule, rule.style.cssText);
                // Disable the hover style
                rule.style.cssText = '';
            }
            if (rule.style?.cursor === 'pointer' && !rule.selectorText?.includes('contextMenu')) {
                // Store the original pointer style
                originalCursorStyles.set(rule, rule.style.cssText);
                // Disable the cursor pointer
                rule.style.cursor = 'auto';
            }
        }
    }
};

export const restoreNonContextMenuEffects = function () {
    originalHoverStyles.forEach((style, rule) => {
        rule.style.cssText = style;
    });
    originalHoverStyles.clear();

    originalCursorStyles.forEach((style, rule) => {
        rule.style.cssText = style;
    });
    originalCursorStyles.clear();
};
