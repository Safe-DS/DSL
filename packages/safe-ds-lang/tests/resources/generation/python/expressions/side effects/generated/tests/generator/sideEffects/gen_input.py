# Imports ----------------------------------------------------------------------

from tests.generator.sideEffects import f

# Segments ---------------------------------------------------------------------

def mySegment(param):
    f()
    __gen_yield_result = param
    return __gen_yield_result

# Pipelines --------------------------------------------------------------------

def test():
    mySegment(True)
    mySegment(0.0)
    mySegment(2)
    mySegment(None)
    mySegment('person: me')
