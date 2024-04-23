# Imports ----------------------------------------------------------------------

import safeds_runner
from special_location import function1InCompilationUnitWithPythonModule, function2InCompilationUnitWithPythonModule
from tests.generator.differentPackageWildcardWithRunnerIntegration import function1InDifferentPackage, function2InDifferentPackage
from tests.generator.wildcardWithRunnerIntegration import f

# Pipelines --------------------------------------------------------------------

def test():
    f(safeds_runner.memoized_static_call(
        "tests.generator.differentPackageWildcardWithRunnerIntegration.function1InDifferentPackage",
         function1InDifferentPackage,
         [],
         {},
         []
    ))
    f(safeds_runner.memoized_static_call(
        "tests.generator.differentPackageWildcardWithRunnerIntegration.function1InDifferentPackage",
         function1InDifferentPackage,
         [],
         {},
         []
    ))
    f(safeds_runner.memoized_static_call(
        "tests.generator.differentPackageWildcardWithRunnerIntegration.function2InDifferentPackage",
         function2InDifferentPackage,
         [],
         {},
         []
    ))
    f(safeds_runner.memoized_static_call(
        "tests.generator.differentPackageWildcardWithRunnerIntegration.function2InDifferentPackage",
         function2InDifferentPackage,
         [],
         {},
         []
    ))
    f(safeds_runner.memoized_static_call(
        "special_location.function1InCompilationUnitWithPythonModule",
         function1InCompilationUnitWithPythonModule,
         [],
         {},
         []
    ))
    f(safeds_runner.memoized_static_call(
        "special_location.function1InCompilationUnitWithPythonModule",
         function1InCompilationUnitWithPythonModule,
         [],
         {},
         []
    ))
    f(safeds_runner.memoized_static_call(
        "special_location.function2InCompilationUnitWithPythonModule",
         function2InCompilationUnitWithPythonModule,
         [],
         {},
         []
    ))
    f(safeds_runner.memoized_static_call(
        "special_location.function2InCompilationUnitWithPythonModule",
         function2InCompilationUnitWithPythonModule,
         [],
         {},
         []
    ))
