# Imports ----------------------------------------------------------------------

from special_location import function1InCompilationUnitWithPythonModule, function2InCompilationUnitWithPythonModule as h
from tests.generator.differentPackage import function1InDifferentPackage, function2InDifferentPackage as g
from tests.generator.imports import f
from tests.generator.imports.gen_context_same_package import segment1InSamePackage, segment2InSamePackage

# Pipelines --------------------------------------------------------------------

def test():
    f(segment1InSamePackage())
    f(segment1InSamePackage())
    f(segment2InSamePackage())
    f(segment2InSamePackage())
    f(function1InDifferentPackage())
    f(function1InDifferentPackage())
    f(g())
    f(g())
    f(function1InCompilationUnitWithPythonModule())
    f(function1InCompilationUnitWithPythonModule())
    f(h())
    f(h())
