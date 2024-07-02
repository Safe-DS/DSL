# Imports ----------------------------------------------------------------------

from tests.generator.partialPureDependency import f, g, g2, g3, g4, noPartialEvalInt

# Pipelines --------------------------------------------------------------------

def testPipeline():
    __gen_lFalse = False
    __gen_lDouble = -1.0
    __gen_lInt = 1
    __gen_lNull = None
    __gen_lStrMulti = 'multi\nline'
    __gen_boolean1 = True
    __gen_value1 = g(True, -1.0, 1, None, 'multi\nline')
    def __gen_lambda_0():
        __gen_i = 1
        __gen_i2 = 3
        __gen_j = 6
        __gen_j2 = 4
        __gen_block_lambda_result_z = 7
        return __gen_block_lambda_result_z
    def __gen_lambda_1():
        return 2
    __gen_o = (f(__gen_lambda_0)) + (f(__gen_lambda_1))
    __gen_mapKey = 'key'
    __gen_mapValue = 'value'
    __gen_mapResult = g2({'key': 'value'})
    __gen_listV1 = 1
    __gen_listV3 = noPartialEvalInt(1)
    __gen_list = [1]
    __gen_list3 = [__gen_listV3]
    __gen_listValue = __gen_list3[0]
    __gen_listResult = g3(__gen_list)
    __gen_result = (((-(__gen_o)) + (1)) + (__gen_value1)) + (((__gen_mapResult) * (__gen_listResult)) / (g4(__gen_listValue)))
