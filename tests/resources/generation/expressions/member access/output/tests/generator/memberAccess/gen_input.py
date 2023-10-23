# Imports ----------------------------------------------------------------------

import safeds_runner.codegen

# Pipelines --------------------------------------------------------------------

def test():
    f(g())
    f(h()[0])
    f(h()[1])
    f(C().a)
    f(C().c)
    f(safeds_runner.codegen.safe_access(factory(), 'a'))
    f(safeds_runner.codegen.safe_access(factory(), 'c'))
    f(1.i(C()))
