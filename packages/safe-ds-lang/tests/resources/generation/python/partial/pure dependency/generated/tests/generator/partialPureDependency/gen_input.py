# Imports ----------------------------------------------------------------------

from tests.generator.partialPureDependency import f, g, g2, g3, g4, noPartialEvalInt

# Pipelines --------------------------------------------------------------------

def testPipeline():
    __gen_placeholder_lFalse = False
    __gen_placeholder_lDouble = -1.0
    __gen_placeholder_lInt = 1
    __gen_placeholder_lNull = None
    __gen_placeholder_lStrMulti = 'multi\nline'
    __gen_placeholder_boolean1 = True
    __gen_placeholder_value1 = g(True, -1.0, 1, None, 'multi\nline')
    def __gen_lambda_0():
        __gen_placeholder_i = 1
        __gen_placeholder_i2 = 3
        __gen_placeholder_j = 6
        __gen_placeholder_j2 = 4
        __gen_block_lambda_result_z = 7
        return __gen_block_lambda_result_z
    def __gen_lambda_1():
        return 2
    __gen_placeholder_o = (f(__gen_lambda_0)) + (f(__gen_lambda_1))
    __gen_placeholder_mapKey = 'key'
    __gen_placeholder_mapValue = 'value'
    __gen_placeholder_mapResult = g2({'key': 'value'})
    __gen_placeholder_listV1 = 1
    __gen_placeholder_listV3 = noPartialEvalInt(1)
    __gen_placeholder_list = [1]
    __gen_placeholder_list3 = [__gen_placeholder_listV3]
    __gen_placeholder_listValue = __gen_placeholder_list3[0]
    __gen_placeholder_listResult = g3(__gen_placeholder_list)
    __gen_placeholder_result = (((-(__gen_placeholder_o)) + (1)) + (__gen_placeholder_value1)) + (((__gen_placeholder_mapResult) * (__gen_placeholder_listResult)) / (g4(__gen_placeholder_listValue)))
