# Imports ----------------------------------------------------------------------

import runtimeBridge

# Steps ------------------------------------------------------------------------

def testStep():
    g()
    a, _, c = g()
    x, _, _ = g()
    f1(a)
    f1(x)
    return c

# Pipelines --------------------------------------------------------------------

def testPipeline():
    g()
    a, _, _ = g()
    runtimeBridge.save_placeholder('a', a)
    x, _, _ = g()
    runtimeBridge.save_placeholder('x', x)
    f1(a)
    f1(x)
    def __block_lambda_0():
        g()
        a, _, c = g()
        x, _, _ = g()
        f1(a)
        f1(x)
        return c
    f2(__block_lambda_0)
