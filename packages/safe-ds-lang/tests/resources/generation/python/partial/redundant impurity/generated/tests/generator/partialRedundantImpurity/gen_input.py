# Imports ----------------------------------------------------------------------

from tests.generator.partialRedundantImpurity import noPartialEvalInt

# Pipelines --------------------------------------------------------------------

def testPipeline():
    __gen_placeholder_pureValue = noPartialEvalInt(2)
    __gen_placeholder_result = (__gen_placeholder_pureValue) - (1)
