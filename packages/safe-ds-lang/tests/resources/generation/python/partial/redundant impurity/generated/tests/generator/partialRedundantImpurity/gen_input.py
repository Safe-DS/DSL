# Imports ----------------------------------------------------------------------

from tests.generator.partialRedundantImpurity import noPartialEvalInt

# Pipelines --------------------------------------------------------------------

def testPipeline():
    pureValue = noPartialEvalInt(2)
    result = (pureValue) - (1)
