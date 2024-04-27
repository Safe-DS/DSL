# Imports ----------------------------------------------------------------------

from tests.generator.partialRedundantImpurity import noPartialEvalInt

# Pipelines --------------------------------------------------------------------

def testPipeline():
    __gen_pureValue = noPartialEvalInt(2)
    __gen_result = (__gen_pureValue) - (1)
