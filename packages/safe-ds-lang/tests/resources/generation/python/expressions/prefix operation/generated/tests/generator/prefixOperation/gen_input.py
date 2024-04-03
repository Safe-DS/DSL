# Imports ----------------------------------------------------------------------

from tests.generator.prefixOperation import f, g, h

# Pipelines --------------------------------------------------------------------

def test():
    f(not (g()))
    f(-(h()))
