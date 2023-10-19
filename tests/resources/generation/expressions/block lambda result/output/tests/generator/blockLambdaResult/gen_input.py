# Steps ------------------------------------------------------------------------

def f1(l):
    h(l(1, 2))

def f2(l):
    h(l(1, 2)[1])
    h(l(1, 2)[0])

# Pipelines --------------------------------------------------------------------

def test():
    def __block_lambda_0(a, b):
        __block_lambda_d = g()
        return __block_lambda_d
    f1(__block_lambda_0)
    def __block_lambda_1(a, b):
        __block_lambda_d = g()
        __block_lambda_e = g()
        return __block_lambda_d, __block_lambda_e
    f2(__block_lambda_1)
