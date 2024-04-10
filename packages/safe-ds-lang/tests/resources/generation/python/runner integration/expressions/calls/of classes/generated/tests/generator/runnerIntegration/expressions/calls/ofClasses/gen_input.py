# Imports ----------------------------------------------------------------------

import safeds_runner
from tests.generator.runnerIntegration.expressions.calls.ofClasses import MyClass

# Pipelines --------------------------------------------------------------------

def test():
    a = safeds_runner.memoized_static_call("tests.generator.runnerIntegration.expressions.calls.ofClasses.MyClass", MyClass, [0], [])
    safeds_runner.save_placeholder('a', a)
