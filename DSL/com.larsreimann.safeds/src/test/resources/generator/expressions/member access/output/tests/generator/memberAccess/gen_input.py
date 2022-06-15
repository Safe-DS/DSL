# Imports ----------------------------------------------------------------------

import safeds.codegen

# Workflows --------------------------------------------------------------------

def test():
    f(g())
    f(h()[0])
    f(h()[1])
    f(C().a)
    f(C().c)
    f(safeds.codegen.safe_access(factory(), 'a'))
    f(safeds.codegen.safe_access(factory(), 'c'))
