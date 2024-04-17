# Imports ----------------------------------------------------------------------

from tests.generator.partialPureDependency import f, g, g2, g3, g4, noPartialEvalInt

# Pipelines --------------------------------------------------------------------

def testPipeline():
    lFalse = False
    lDouble = -1.0
    lInt = 1
    lNull = None
    lStrMulti = 'multi\nline'
    boolean1 = True
    value1 = g(True, -1.0, 1, None, 'multi\nline')
    def __gen_block_lambda_0():
        i = 1
        i2 = 3
        j = 6
        j2 = 4
        __gen_block_lambda_result_z = 7
        return __gen_block_lambda_result_z
    o = (f(__gen_block_lambda_0)) + (f(lambda : 2))
    mapKey = 'key'
    mapValue = 'value'
    mapResult = g2({'key': 'value'})
    listV1 = 1
    listV3 = noPartialEvalInt(1)
    list = [1]
    list3 = [listV3]
    listValue = list3[0]
    listResult = g3(list)
    result = (((-(o)) + (1)) + (value1)) + (((mapResult) * (listResult)) / (g4(listValue)))
