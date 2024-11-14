# Imports ----------------------------------------------------------------------

import safeds_runner
from tests.generation.python.runnerIntegration.blockLambdas import C, f

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
    __gen_placeholder__result = safeds_runner.memoized_static_call(
        "tests.generation.python.runnerIntegration.blockLambdas.f",
        f,
        [__gen_lambda_1],
        {},
        []
    )
    safeds_runner.save_placeholder('_result', __gen_placeholder__result)
    __gen_receiver_2 = safeds_runner.memoized_static_call(
        "tests.generation.python.runnerIntegration.blockLambdas.C",
        C,
        [],
        {},
        []
    )
    def __gen_lambda_4(a):
        __gen_receiver_3 = a
        __gen_block_lambda_result_result = safeds_runner.memoized_dynamic_call(
            __gen_receiver_3,
            "parent",
            [],
            {},
            []
        )
        return __gen_block_lambda_result_result
    __gen_placeholder_result2 = safeds_runner.memoized_dynamic_call(
        __gen_receiver_2,
        "f1",
        [__gen_lambda_4],
        {},
        []
    )
    safeds_runner.save_placeholder('result2', __gen_placeholder_result2)
    __gen_receiver_5 = __gen_placeholder_result2
    __gen_placeholder_result3 = safeds_runner.memoized_dynamic_call(
        __gen_receiver_5,
        "parent",
        [],
        {},
        []
    )
    safeds_runner.save_placeholder('result3', __gen_placeholder_result3)
