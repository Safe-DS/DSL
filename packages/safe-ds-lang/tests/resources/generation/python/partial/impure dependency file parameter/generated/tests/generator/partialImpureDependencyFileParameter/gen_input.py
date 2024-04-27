# Imports ----------------------------------------------------------------------

from tests.generator.partialImpureDependencyFileParameter import iFileRead, iFileWrite

# Pipelines --------------------------------------------------------------------

def testPipeline():
    __gen_impureFileWrite = iFileWrite('b.txt')
    __gen_impureFileWrite2 = iFileWrite('c.txt')
    __gen_impureFileReadAgain = iFileRead('d.txt')
    __gen_result = (__gen_impureFileReadAgain) + (2)
