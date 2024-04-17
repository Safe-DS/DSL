# Imports ----------------------------------------------------------------------

from tests.generator.expressionLambda import f

# Pipelines --------------------------------------------------------------------

def test():
    f(lambda a, b=2: 1)
    f(lambda a, b: 1)
