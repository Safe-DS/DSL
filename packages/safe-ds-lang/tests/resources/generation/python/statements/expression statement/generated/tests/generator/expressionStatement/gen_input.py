# Imports ----------------------------------------------------------------------

from tests.generator.expressionStatement import f, g

# Segments ---------------------------------------------------------------------

def testSegment():
    g()

# Pipelines --------------------------------------------------------------------

def testPipeline():
    g()
    def __gen_lambda_0():
        g()
    f(__gen_lambda_0)
