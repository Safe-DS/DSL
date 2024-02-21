# Imports ----------------------------------------------------------------------

from typing import Any, TypeVar

# Type variables ---------------------------------------------------------------

__gen_T = TypeVar("__gen_T")

# Utils ------------------------------------------------------------------------

def __gen_null_safe_member_access(receiver: Any, member_name: str) -> __gen_T | None:
    return getattr(receiver, member_name) if receiver is not None else None

# Pipelines --------------------------------------------------------------------

def test():
    f(g())
    f(h()[0])
    f(h()[1])
    f(C().a)
    f(C().c)
    f(__gen_null_safe_member_access(factory(), 'a'))
    f(__gen_null_safe_member_access(factory(), 'c'))
    f(1.i(C()))
    f(C().j(123))
    f(C().k2('abc'))
    f(C.from_csv_file('abc.csv'))
