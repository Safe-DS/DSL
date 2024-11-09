# Imports ----------------------------------------------------------------------

import safeds_runner
from tests.generator.runnerIntegration.outputStatement import iFileRead, iFileWrite

# Pipelines --------------------------------------------------------------------

def testPipeline():
    __gen_placeholder_impureFileWrite = iFileWrite('b.txt')
    safeds_runner.save_placeholder('impureFileWrite', __gen_placeholder_impureFileWrite)
    __gen_placeholder_impureFileWrite2 = iFileWrite('c.txt')
    safeds_runner.save_placeholder('impureFileWrite2', __gen_placeholder_impureFileWrite2)
    __gen_placeholder_impureFileReadAgain = safeds_runner.memoized_static_call(
        "tests.generator.runnerIntegration.outputStatement.iFileRead",
        iFileRead,
        [safeds_runner.absolute_path('d.txt')],
        {},
        [safeds_runner.file_mtime('d.txt')]
    )
    safeds_runner.save_placeholder('impureFileReadAgain', __gen_placeholder_impureFileReadAgain)
    __gen_output_4_expression = (__gen_placeholder_impureFileReadAgain) + (2)
    safeds_runner.save_placeholder('__gen_4_expression', __gen_output_4_expression)
