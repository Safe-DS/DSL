import {createSafeDsServices} from "../../src/language-server/safe-ds-module";
import {expectFormatting} from "langium/test";
import {describe, it} from "vitest";
import {EmptyFileSystem, normalizeEOL} from "langium";
import {listTestResources, resolvePathRelativeToResources} from "../helpers/testResources";
import path from "path";
import fs from "fs";

const services = createSafeDsServices({...EmptyFileSystem}).SafeDs;
const separator = "// -----------------------------------------------------------------------------";

describe('grammar', () => {
    it.each(createFormatterTest())('$testName', async (test) => {
        if (test.error) {
            throw test.error;
        }

        await expectFormatting(services)({
            before: test.originalCode,
            after: test.expectedFormattedCode
        });
    });
});

const createFormatterTest = (): FormatterTest[] => {
    return listTestResources('formatting').map((pathRelativeToResources): FormatterTest => {
        const absolutePath = resolvePathRelativeToResources(path.join('formatting', pathRelativeToResources));
        const program = fs.readFileSync(absolutePath).toString();
        const parts = program.split(separator);

        if (parts.length !== 2) {
            return {
                testName: `INVALID TEST FILE [${pathRelativeToResources}]`,
                originalCode: "",
                expectedFormattedCode: "",
                error: new SeparatorError(parts.length - 1)
            }
        }

        return {
            testName: `${pathRelativeToResources} should be formatted correctly`,
            originalCode: normalizeLineBreaks(parts[0]).trimEnd(),
            expectedFormattedCode: normalizeLineBreaks(parts[1]).trim(),
        }
    });
}

const normalizeLineBreaks = (code: string): string => {
    return code.replace(/\r\n?/ug, '\n');
}

interface FormatterTest {
    testName: string;
    originalCode: string;
    expectedFormattedCode: string;
    error?: Error;
}

class SeparatorError extends Error {
    constructor(readonly number_of_separators: number) {
        super(`Expected exactly one separator but found ${number_of_separators}.`);
    }
}
