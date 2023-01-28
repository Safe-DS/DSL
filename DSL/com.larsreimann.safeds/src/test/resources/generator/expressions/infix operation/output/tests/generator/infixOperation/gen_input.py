# Imports ----------------------------------------------------------------------

import safeds_runner.codegen

# Pipelines --------------------------------------------------------------------

def test():
    f(safeds_runner.codegen.eager_or(g(), g()))
    f(safeds_runner.codegen.eager_and(g(), g()))
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
    f(safeds_runner.codegen.eager_elvis(i(), i()))
