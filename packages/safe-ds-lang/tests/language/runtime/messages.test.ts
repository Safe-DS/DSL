import { describe, expect, it } from 'vitest';
import { ToStringTest } from '../../helpers/testDescription.js';
import {
    createPlaceholderQueryMessage,
    createProgramMessage,
    createShutdownMessage,
    PythonServerMessage,
} from '../../../src/language/runtime/messages.js';

describe('runner messages', async () => {
    const toStringTests: ToStringTest<() => PythonServerMessage>[] = [
        {
            value: () =>
                createProgramMessage('abcdefgh', {
                    code: {
                        a: {
                            gen_test_a: 'def pipe():\n\tpass\n',
                            gen_test_a_pipe: "from gen_test_a import pipe\n\nif __name__ == '__main__':\n\tpipe()",
                        },
                    },
                    main: { modulepath: 'a', module: 'test_a', pipeline: 'pipe' },
                }),
            expectedString:
                '{"type":"program","id":"abcdefgh","data":{"code":{"a":{"gen_test_a":"def pipe():\\n\\tpass\\n","gen_test_a_pipe":"from gen_test_a import pipe\\n\\nif __name__ == \'__main__\':\\n\\tpipe()"}},"main":{"modulepath":"a","module":"test_a","pipeline":"pipe"}}}',
        },
        {
            value: () => createPlaceholderQueryMessage('abcdefg', 'value1', 2, 1),
            expectedString:
                '{"type":"placeholder_query","id":"abcdefg","data":{"name":"value1","window":{"begin":2,"size":1}}}',
        },
        {
            value: () => createPlaceholderQueryMessage('abcdefg', 'value1', 1),
            expectedString: '{"type":"placeholder_query","id":"abcdefg","data":{"name":"value1","window":{"begin":1}}}',
        },
        {
            value: () => createPlaceholderQueryMessage('abcdefg', 'value1', undefined, 1),
            expectedString: '{"type":"placeholder_query","id":"abcdefg","data":{"name":"value1","window":{"size":1}}}',
        },
        {
            value: () => createPlaceholderQueryMessage('abcdefg', 'value1'),
            expectedString: '{"type":"placeholder_query","id":"abcdefg","data":{"name":"value1","window":{}}}',
        },
        {
            value: () => createShutdownMessage(),
            expectedString: '{"type":"shutdown","id":"","data":""}',
        },
    ];

    describe.each(toStringTests)('stringify', ({ value, expectedString }) => {
        it(`should return the expected JSON representation of runner message (type: ${JSON.parse(expectedString).type})`, () => {
            expect(JSON.stringify(value())).toStrictEqual(expectedString);
        });
    });
});
