# Imports ----------------------------------------------------------------------

import safeds_runner
from tests.generator.runnerIntegration.expressions.this import MyClass

# Pipelines --------------------------------------------------------------------

def myPipeline():
    __gen_receiver_0 = safeds_runner.memoized_static_call(
        "tests.generator.runnerIntegration.expressions.this.MyClass",
        MyClass,
        [],
        {},
        []
    )
    a = safeds_runner.memoized_dynamic_call(
        __gen_receiver_0,
        "myFunction",
        [],
        {"p": __gen_receiver_0},
        []
    )
    safeds_runner.save_placeholder('a', a)
