# Imports ----------------------------------------------------------------------

import safeds_runner
from tests.generation.python.runnerIntegration.blockLambdas import f

# Pipelines --------------------------------------------------------------------

def myPipeline():
    def __gen_lambda_1(p):
        __gen_receiver_0 = p
        __gen_block_lambda_result_r = safeds_runner.memoized_dynamic_call(
            __gen_receiver_0,
            "g",
            [],
            {},
            []
        )
        return __gen_block_lambda_result_r
    __gen_result = safeds_runner.memoized_static_call(
        "tests.generation.python.runnerIntegration.blockLambdas.f",
        f,
        [__gen_lambda_1],
        {},
        []
    )
    safeds_runner.save_placeholder('result', __gen_result)
