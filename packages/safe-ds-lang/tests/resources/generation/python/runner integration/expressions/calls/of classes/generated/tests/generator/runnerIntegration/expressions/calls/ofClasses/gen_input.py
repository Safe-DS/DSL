# Imports ----------------------------------------------------------------------

import safeds_runner

# Pipelines --------------------------------------------------------------------

def test():
    a = safeds_runner.memoized_call("tests.generator.runnerIntegration.expressions.calls.ofClasses.MyClass", MyClass, [0], [])
    safeds_runner.save_placeholder('a', a)
