# Imports ----------------------------------------------------------------------

import safeds_runner
from tests.generator.importsWithRunnerIntegration import impureFunction

# Segments ---------------------------------------------------------------------

def segment1InSamePackage():
    __gen_yield_result = safeds_runner.memoized_static_call("tests.generator.importsWithRunnerIntegration.impureFunction", impureFunction, [], [])
    return __gen_yield_result

def segment2InSamePackage():
    __gen_yield_result = safeds_runner.memoized_static_call("tests.generator.importsWithRunnerIntegration.impureFunction", impureFunction, [], [])
    return __gen_yield_result
