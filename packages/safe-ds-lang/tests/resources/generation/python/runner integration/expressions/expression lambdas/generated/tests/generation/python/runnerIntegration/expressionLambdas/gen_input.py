# Imports ----------------------------------------------------------------------

import safeds_runner
from tests.generation.python.runnerIntegration.expressionLambdas import f

# Pipelines --------------------------------------------------------------------

def myPipeline():
    def __gen_lambda_0(p):
        __gen_receiver_1 = p
        return safeds_runner.memoized_dynamic_call(
            __gen_receiver_1,
            "g",
            [],
            {},
            []
        )
    __gen_result = safeds_runner.memoized_static_call(
        "tests.generation.python.runnerIntegration.expressionLambdas.f",
        f,
        [__gen_lambda_0],
        {},
        []
    )
    safeds_runner.save_placeholder('result', __gen_result)
