# Imports ----------------------------------------------------------------------

import safeds_runner.codegen
import safeds_runner.server.pipeline_manager

# Pipelines --------------------------------------------------------------------

def test():
    f(safeds_runner.codegen.eager_or(safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.g", g, [], []), safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.g", g, [], [])))
    f(safeds_runner.codegen.eager_and(safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.g", g, [], []), safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.g", g, [], [])))
    f((safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.h", h, [], [])) == (safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.h", h, [], [])))
    f((safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.h", h, [], [])) != (safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.h", h, [], [])))
    f((safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.h", h, [], [])) is (safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.h", h, [], [])))
    f((safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.h", h, [], [])) is not (safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.h", h, [], [])))
    f((safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.h", h, [], [])) < (safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.h", h, [], [])))
    f((safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.h", h, [], [])) <= (safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.h", h, [], [])))
    f((safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.h", h, [], [])) >= (safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.h", h, [], [])))
    f((safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.h", h, [], [])) > (safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.h", h, [], [])))
    f((safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.h", h, [], [])) + (safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.h", h, [], [])))
    f((safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.h", h, [], [])) - (safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.h", h, [], [])))
    f((safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.h", h, [], [])) * (safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.h", h, [], [])))
    f((safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.h", h, [], [])) / (safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.h", h, [], [])))
    f(safeds_runner.codegen.eager_elvis(safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.i", i, [], []), safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.infixOperation.i", i, [], [])))
