# Segments ---------------------------------------------------------------------

def test(param1, param_2, param_3=0):
    f1(lambda param1, param2, param3=0: 1)
    def __gen_block_lambda_0(param1, param2, param3=0):
        pass
    f2(__gen_block_lambda_0)
