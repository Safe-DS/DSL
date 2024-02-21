# Imports ----------------------------------------------------------------------

import safeds_runner.server.pipeline_manager

# Segments ---------------------------------------------------------------------

def segment1InSamePackage():
    __gen_yield_result = safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.importsWithRunnerIntegration.impureFunction", impureFunction, [], [])
    return __gen_yield_result

def segment2InSamePackage():
    __gen_yield_result = safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.importsWithRunnerIntegration.impureFunction", impureFunction, [], [])
    return __gen_yield_result
