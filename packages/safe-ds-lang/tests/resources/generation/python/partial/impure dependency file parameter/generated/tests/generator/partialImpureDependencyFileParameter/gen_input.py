# Imports ----------------------------------------------------------------------

from tests.generator.partialImpureDependencyFileParameter import iFileRead, iFileWrite

# Pipelines --------------------------------------------------------------------

def testPipeline():
    __gen_placeholder_impureFileWrite = iFileWrite('b.txt')
    __gen_placeholder_impureFileWrite2 = iFileWrite('c.txt')
    __gen_placeholder_impureFileReadAgain = iFileRead('d.txt')
    __gen_placeholder_result = (__gen_placeholder_impureFileReadAgain) + (2)
