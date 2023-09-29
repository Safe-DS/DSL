# Steps ------------------------------------------------------------------------

def test1(param1, param_2, param_3=0):
    f1(lambda param1, param_2, param_3=0: 1)
    def __block_lambda_0(param1, param_2, param_3=0):
        pass
    f2(__block_lambda_0)

def test2(param1, param_2, *param_4):
    f1(lambda param1, param_2, *param_4: 1)
    def __block_lambda_0(param1, param_2, *param_4):
        pass
    f2(__block_lambda_0)
