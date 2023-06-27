const pattern = /\/\/\s*\$TEST\$(?<comment>[^\n]*)/gu;

export const findTestComments = (program: string): string[] => {
    const comments: string[] = [];
    for (const match of program.matchAll(pattern)) {
        const comment = match.groups?.comment ?? '';
        comments.push(comment.trim());
    }
    return comments;
};
