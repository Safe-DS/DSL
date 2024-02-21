# Imports ----------------------------------------------------------------------

import safeds_runner.server.pipeline_manager

# Pipelines --------------------------------------------------------------------

def testPipeline():
    lFalse = False
    safeds_runner.server.pipeline_manager.runner_save_placeholder('lFalse', lFalse)
    lDouble = -1.0
    safeds_runner.server.pipeline_manager.runner_save_placeholder('lDouble', lDouble)
    lInt = 1
    safeds_runner.server.pipeline_manager.runner_save_placeholder('lInt', lInt)
    lNull = None
    safeds_runner.server.pipeline_manager.runner_save_placeholder('lNull', lNull)
    lStrMulti = 'multi\nline'
    safeds_runner.server.pipeline_manager.runner_save_placeholder('lStrMulti', lStrMulti)
    boolean1 = True
    safeds_runner.server.pipeline_manager.runner_save_placeholder('boolean1', boolean1)
    value1 = safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.partialPureDependency.g", g, [True, -1.0, 1, None, 'multi\nline'], [])
    safeds_runner.server.pipeline_manager.runner_save_placeholder('value1', value1)
    def __gen_block_lambda_0():
        i = 1
        i2 = 3
        j = 6
        j2 = 4
        __gen_block_lambda_result_z = 7
        return __gen_block_lambda_result_z
    o = (safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.partialPureDependency.f", f, [__gen_block_lambda_0], [])) + (safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.partialPureDependency.f", f, [lambda : 2], []))
    safeds_runner.server.pipeline_manager.runner_save_placeholder('o', o)
    mapKey = 'key'
    safeds_runner.server.pipeline_manager.runner_save_placeholder('mapKey', mapKey)
    mapValue = 'value'
    safeds_runner.server.pipeline_manager.runner_save_placeholder('mapValue', mapValue)
    mapResult = safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.partialPureDependency.g2", g2, [{'key': 'value'}], [])
    safeds_runner.server.pipeline_manager.runner_save_placeholder('mapResult', mapResult)
    listV1 = 1
    safeds_runner.server.pipeline_manager.runner_save_placeholder('listV1', listV1)
    listV3 = safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.partialPureDependency.noPartialEvalInt", noPartialEvalInt, [1], [])
    safeds_runner.server.pipeline_manager.runner_save_placeholder('listV3', listV3)
    list = [1]
    safeds_runner.server.pipeline_manager.runner_save_placeholder('list', list)
    list3 = [listV3]
    safeds_runner.server.pipeline_manager.runner_save_placeholder('list3', list3)
    listValue = list3[0]
    safeds_runner.server.pipeline_manager.runner_save_placeholder('listValue', listValue)
    listResult = safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.partialPureDependency.g3", g3, [list], [])
    safeds_runner.server.pipeline_manager.runner_save_placeholder('listResult', listResult)
    result = (((-(o)) + (1)) + (value1)) + (((mapResult) * (listResult)) / (safeds_runner.server.pipeline_manager.runner_memoized_function_call("tests.generator.partialPureDependency.g4", g4, [listValue], [])))
    safeds_runner.server.pipeline_manager.runner_save_placeholder('result', result)
