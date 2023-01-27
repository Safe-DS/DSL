# Imports ----------------------------------------------------------------------

import safeds.codegen

# Pipelines --------------------------------------------------------------------

def test():
    f(safeds.codegen.eager_or(g(), g()))
    f(safeds.codegen.eager_and(g(), g()))
    f((h()) == (h()))
    f((h()) != (h()))
    f((h()) is (h()))
    f((h()) is not (h()))
    f((h()) < (h()))
    f((h()) <= (h()))
    f((h()) >= (h()))
    f((h()) > (h()))
    f((h()) + (h()))
    f((h()) - (h()))
    f((h()) * (h()))
    f((h()) / (h()))
    f(safeds.codegen.eager_elvis(i(), i()))
