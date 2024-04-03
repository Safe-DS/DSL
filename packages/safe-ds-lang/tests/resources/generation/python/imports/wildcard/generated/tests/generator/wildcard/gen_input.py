# Imports ----------------------------------------------------------------------

from special_location import function1InCompilationUnitWithPythonModule, function2InCompilationUnitWithPythonModule
from tests.generator.differentPackageWildcard import function1InDifferentPackage, function2InDifferentPackage
from tests.generator.wildcard import f

# Pipelines --------------------------------------------------------------------

def test():
    f(function1InDifferentPackage())
    f(function1InDifferentPackage())
    f(function2InDifferentPackage())
    f(function2InDifferentPackage())
    f(function1InCompilationUnitWithPythonModule())
    f(function1InCompilationUnitWithPythonModule())
    f(function2InCompilationUnitWithPythonModule())
    f(function2InCompilationUnitWithPythonModule())
