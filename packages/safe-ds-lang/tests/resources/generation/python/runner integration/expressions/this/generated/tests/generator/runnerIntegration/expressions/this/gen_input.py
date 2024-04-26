# Imports ----------------------------------------------------------------------

import safeds_runner
from tests.generator.runnerIntegration.expressions.this import MyClass

# Pipelines --------------------------------------------------------------------

def myPipeline():
    a = safeds_runner.memoized_dynamic_call(
        safeds_runner.memoized_static_call(
            "tests.generator.runnerIntegration.expressions.this.MyClass",
            MyClass,
            [],
            {},
            []
        ),
        "myFunction",
        [],
        {"p": safeds_runner.memoized_static_call(
            "tests.generator.runnerIntegration.expressions.this.MyClass",
            MyClass,
            [],
            {},
            []
        )},
        []
    )
    safeds_runner.save_placeholder('a', a)
