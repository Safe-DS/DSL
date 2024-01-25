# Imports ----------------------------------------------------------------------

import safeds_runner.server.pipeline_manager
from special_location import function1InCompilationUnitWithPythonModule, function2InCompilationUnitWithPythonModule as h
from tests.generator.differentPackage import function1InDifferentPackage, function2InDifferentPackage as g
from tests.generator.imports.gen_context_same_package import segment1InSamePackage, segment2InSamePackage

# Pipelines --------------------------------------------------------------------

def test():
    f(segment1InSamePackage())
    f(segment1InSamePackage())
    f(segment2InSamePackage())
    f(segment2InSamePackage())
    f(safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.differentPackage.function1InDifferentPackage", function1InDifferentPackage, [], []))
    f(safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.differentPackage.function1InDifferentPackage", function1InDifferentPackage, [], []))
    f(safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.differentPackage.function2InDifferentPackage", g, [], []))
    f(safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.differentPackage.function2InDifferentPackage", g, [], []))
    f(safeds_runner.server.pipeline_manager.runner_memoized_function_call("special_location.function1InCompilationUnitWithPythonModule", function1InCompilationUnitWithPythonModule, [], []))
    f(safeds_runner.server.pipeline_manager.runner_memoized_function_call("special_location.function1InCompilationUnitWithPythonModule", function1InCompilationUnitWithPythonModule, [], []))
    f(safeds_runner.server.pipeline_manager.runner_memoized_function_call("special_location.function2InCompilationUnitWithPythonModule", h, [], []))
    f(safeds_runner.server.pipeline_manager.runner_memoized_function_call("special_location.function2InCompilationUnitWithPythonModule", h, [], []))
