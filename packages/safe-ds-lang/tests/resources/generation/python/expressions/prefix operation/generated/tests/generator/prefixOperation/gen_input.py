# Imports ----------------------------------------------------------------------

from tests.generator.prefixOperation import cell, f, g, h

# Pipelines --------------------------------------------------------------------

def test():
    f(not (g()))
    f(~(cell()))
    f(-(h()))
    f(-(cell()))
