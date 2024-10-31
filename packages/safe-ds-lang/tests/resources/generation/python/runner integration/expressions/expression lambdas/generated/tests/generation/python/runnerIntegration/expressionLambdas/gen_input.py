# Imports ----------------------------------------------------------------------

import safeds_runner
from tests.generation.python.runnerIntegration.expressionLambdas import C, f

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
    __gen_placeholder__result = safeds_runner.memoized_static_call(
        "tests.generation.python.runnerIntegration.expressionLambdas.f",
        f,
        [__gen_lambda_0],
        {},
        []
    )
    safeds_runner.save_placeholder('_result', __gen_placeholder__result)
    __gen_receiver_2 = safeds_runner.memoized_static_call(
        "tests.generation.python.runnerIntegration.expressionLambdas.C",
        C,
        [],
        {},
        []
    )
    def __gen_lambda_3(a):
        __gen_receiver_4 = a
        return safeds_runner.memoized_dynamic_call(
            __gen_receiver_4,
            "parent",
            [],
            {},
            []
        )
    __gen_placeholder_result2 = safeds_runner.memoized_dynamic_call(
        __gen_receiver_2,
        "f1",
        [__gen_lambda_3],
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
