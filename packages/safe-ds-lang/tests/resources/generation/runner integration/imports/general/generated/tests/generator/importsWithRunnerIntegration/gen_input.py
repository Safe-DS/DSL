# Imports ----------------------------------------------------------------------

import safeds_runner
from special_location import function1InCompilationUnitWithPythonModule, function2InCompilationUnitWithPythonModule as h
from tests.generator.differentPackageWithRunnerIntegration import function1InDifferentPackage, function2InDifferentPackage as g
from tests.generator.importsWithRunnerIntegration.gen_context_same_package import segment1InSamePackage, segment2InSamePackage

# Pipelines --------------------------------------------------------------------

def test():
    f(segment1InSamePackage())
    f(segment1InSamePackage())
    f(segment2InSamePackage())
    f(segment2InSamePackage())
    f(safeds_runner.memoized_call("tests.generator.differentPackageWithRunnerIntegration.function1InDifferentPackage", function1InDifferentPackage, [], []))
    f(safeds_runner.memoized_call("tests.generator.differentPackageWithRunnerIntegration.function1InDifferentPackage", function1InDifferentPackage, [], []))
    f(safeds_runner.memoized_call("tests.generator.differentPackageWithRunnerIntegration.function2InDifferentPackage", g, [], []))
    f(safeds_runner.memoized_call("tests.generator.differentPackageWithRunnerIntegration.function2InDifferentPackage", g, [], []))
    f(safeds_runner.memoized_call("special_location.function1InCompilationUnitWithPythonModule", function1InCompilationUnitWithPythonModule, [], []))
    f(safeds_runner.memoized_call("special_location.function1InCompilationUnitWithPythonModule", function1InCompilationUnitWithPythonModule, [], []))
    f(safeds_runner.memoized_call("special_location.function2InCompilationUnitWithPythonModule", h, [], []))
    f(safeds_runner.memoized_call("special_location.function2InCompilationUnitWithPythonModule", h, [], []))
