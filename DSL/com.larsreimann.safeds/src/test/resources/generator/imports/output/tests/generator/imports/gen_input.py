# Imports ----------------------------------------------------------------------

from special_location import function1InCompilationUnitWithPythonModule, function2InCompilationUnitWithPythonModule as h
from tests.generator.differentPackage import function1InDifferentPackage, function2InDifferentPackage as g
from tests.generator.imports.gen__skip__context_same_package import step1InSamePackage, step2InSamePackage

# Pipelines --------------------------------------------------------------------

def test():
    f(step1InSamePackage())
    f(step1InSamePackage())
    f(step2InSamePackage())
    f(step2InSamePackage())
    f(function1InDifferentPackage())
    f(function1InDifferentPackage())
    f(g())
    f(g())
    f(function1InCompilationUnitWithPythonModule())
    f(function1InCompilationUnitWithPythonModule())
    f(h())
    f(h())
