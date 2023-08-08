const pattern = /\/\/\s*\$TEST\$(?<comment>[^\n]*)/gu;

/**
 * Finds all test comments (`// $TEST$ ...`) in the given program.
 *
 * @param program The program with test comments.
 * @return The list of test comments.
 */
export const findTestComments = (program: string): string[] => {
    const comments: string[] = [];
    for (const match of program.matchAll(pattern)) {
        const comment = match.groups?.comment ?? '';
        comments.push(comment.trim());
    }
    return comments;
};
