import { DefaultFuzzyMatcher } from 'langium/lsp';

export class SafeDsFuzzyMatcher extends DefaultFuzzyMatcher {
    public override match(query: string, text: string): boolean {
        // Fixes a bug in the default fuzzy matcher. Can be removed once the bug is fixed upstream.
        if (query.length === 0) {
            return true;
        }

        // eslint-disable-next-line no-param-reassign
        let matchedFirstCharacter = false;
        let previous: number | undefined = undefined;
        let character = 0;
        const len = text.length;
        for (let i = 0; i < len; i++) {
            const strChar = text.charCodeAt(i);
            const testChar = query.charCodeAt(character);
            if (strChar === testChar || this.toUpperCharCode(strChar) === this.toUpperCharCode(testChar)) {
                matchedFirstCharacter ||=
                    previous === undefined || // Beginning of word
                    this.isWordTransition(previous, strChar);
                if (matchedFirstCharacter) {
                    character++;
                }
                if (character === query.length) {
                    return true;
                }
            }
            previous = strChar;
        }
        return false;
    }
}
