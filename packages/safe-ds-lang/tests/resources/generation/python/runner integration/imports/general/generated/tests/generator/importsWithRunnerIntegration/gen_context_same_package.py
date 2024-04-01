# Imports ----------------------------------------------------------------------

import safeds_runner

# Segments ---------------------------------------------------------------------

def segment1InSamePackage():
    __gen_yield_result = safeds_runner.memoized_call("tests.generator.importsWithRunnerIntegration.impureFunction", impureFunction, [], [])
    return __gen_yield_result

def segment2InSamePackage():
    __gen_yield_result = safeds_runner.memoized_call("tests.generator.importsWithRunnerIntegration.impureFunction", impureFunction, [], [])
    return __gen_yield_result
