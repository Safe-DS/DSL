# Imports ----------------------------------------------------------------------

import safeds_runner
from safeds.data.tabular.containers import Table
from safeds.data.tabular.transformation import OneHotEncoder
from tests.generator.memberAccessWithRunnerIntegration import C, f, factory, factoryNested, g, h, Outer
from typing import Any, TypeVar

# Type variables ---------------------------------------------------------------

__gen_T = TypeVar("__gen_T")

# Utils ------------------------------------------------------------------------

def __gen_null_safe_member_access(receiver: Any, member_name: str) -> __gen_T | None:
    return getattr(receiver, member_name) if receiver is not None else None

# Pipelines --------------------------------------------------------------------

def test():
    f(safeds_runner.memoized_static_call(
        "tests.generator.memberAccessWithRunnerIntegration.g",
        g,
        [],
        {},
        []
    ))
    f(safeds_runner.memoized_static_call(
        "tests.generator.memberAccessWithRunnerIntegration.h",
        h,
        [],
        {},
        []
    )[0])
    f(safeds_runner.memoized_static_call(
        "tests.generator.memberAccessWithRunnerIntegration.h",
        h,
        [],
        {},
        []
    )[1])
    f(safeds_runner.memoized_static_call(
        "tests.generator.memberAccessWithRunnerIntegration.C",
        C,
        [],
        {},
        []
    ).a)
    f(safeds_runner.memoized_static_call(
        "tests.generator.memberAccessWithRunnerIntegration.C",
        C,
        [],
        {},
        []
    ).c)
    f(__gen_null_safe_member_access(safeds_runner.memoized_static_call(
        "tests.generator.memberAccessWithRunnerIntegration.factory",
        factory,
        [],
        {},
        []
    ), 'a'))
    f(__gen_null_safe_member_access(safeds_runner.memoized_static_call(
        "tests.generator.memberAccessWithRunnerIntegration.factory",
        factory,
        [],
        {},
        []
    ), 'c'))
    __gen_receiver_0 = safeds_runner.memoized_static_call(
        "tests.generator.memberAccessWithRunnerIntegration.C",
        C,
        [],
        {},
        []
    )
    f(safeds_runner.memoized_static_call(
        "tests.generator.memberAccessWithRunnerIntegration.C.i",
        lambda *_ : 1.i(__gen_receiver_0),
        [__gen_receiver_0, 1],
        {},
        []
    ))
    c1 = safeds_runner.memoized_static_call(
        "tests.generator.memberAccessWithRunnerIntegration.C",
        C,
        [],
        {},
        []
    )
    safeds_runner.save_placeholder('c1', c1)
    __gen_receiver_1 = c1
    f(safeds_runner.memoized_static_call(
        "tests.generator.memberAccessWithRunnerIntegration.C.i",
        lambda *_ : 1.i(__gen_receiver_1),
        [__gen_receiver_1, 1],
        {},
        []
    ))
    __gen_receiver_2 = safeds_runner.memoized_static_call(
        "tests.generator.memberAccessWithRunnerIntegration.C",
        C,
        [],
        {},
        []
    )
    f(safeds_runner.memoized_dynamic_call(
        __gen_receiver_2,
        "j",
        [123],
        {},
        []
    ))
    __gen_receiver_3 = safeds_runner.memoized_static_call(
        "tests.generator.memberAccessWithRunnerIntegration.C",
        C,
        [],
        {},
        []
    )
    f(safeds_runner.memoized_dynamic_call(
        __gen_receiver_3,
        "k2",
        ['abc'],
        {},
        []
    ))
    __gen_receiver_4 = C
    f(safeds_runner.memoized_static_call(
        "tests.generator.memberAccessWithRunnerIntegration.C.l",
        lambda *_ : 2.i(),
        [2],
        {},
        []
    ))
    __gen_receiver_5 = safeds_runner.memoized_static_call(
        "tests.generator.memberAccessWithRunnerIntegration.C",
        C,
        [],
        {},
        []
    )
    f(safeds_runner.memoized_dynamic_call(
        __gen_receiver_5,
        "m",
        [],
        {"param": 213},
        []
    ))
    __gen_receiver_6 = c1
    f(safeds_runner.memoized_dynamic_call(
        __gen_receiver_6,
        "m",
        [],
        {"param": 213},
        []
    ))
    f(safeds_runner.memoized_static_call(
        "tests.generator.memberAccessWithRunnerIntegration.C.n",
        C.n,
        [],
        {"param": 213},
        []
    ))
    __gen_receiver_7 = safeds_runner.memoized_static_call(
        "tests.generator.memberAccessWithRunnerIntegration.C.o",
        C.o,
        [],
        {"param": 42},
        []
    )
    f(safeds_runner.memoized_dynamic_call(
        __gen_receiver_7,
        "m",
        [],
        {"param": 213},
        []
    ))
    __gen_receiver_8 = safeds_runner.memoized_static_call(
        "tests.generator.memberAccessWithRunnerIntegration.C.o",
        C.o,
        [],
        {"param": 42},
        []
    )
    f(safeds_runner.memoized_dynamic_call(
        __gen_receiver_8,
        "j",
        [213],
        {},
        []
    ))
    __gen_receiver_9 = safeds_runner.memoized_static_call(
        "tests.generator.memberAccessWithRunnerIntegration.C.p",
        C.p,
        [],
        {},
        []
    )
    f(safeds_runner.memoized_dynamic_call(
        __gen_receiver_9,
        "j",
        [213],
        {},
        []
    ))
    f(safeds_runner.memoized_static_call(
        "tests.generator.memberAccessWithRunnerIntegration.C.from_csv_file",
        C.from_csv_file,
        [safeds_runner.absolute_path('abc.csv')],
        {},
        [safeds_runner.file_mtime('abc.csv')]
    ))
    a = safeds_runner.memoized_static_call(
        "safeds.data.tabular.containers.Table.from_csv_file",
        Table.from_csv_file,
        [safeds_runner.absolute_path('abc.csv')],
        {},
        [safeds_runner.file_mtime('abc.csv')]
    )
    safeds_runner.save_placeholder('a', a)
    __gen_receiver_10 = safeds_runner.memoized_static_call(
        "safeds.data.tabular.containers.Table.from_csv_file",
        Table.from_csv_file,
        [safeds_runner.absolute_path('abc.csv')],
        {},
        [safeds_runner.file_mtime('abc.csv')]
    )
    a2 = safeds_runner.memoized_dynamic_call(
        __gen_receiver_10,
        "remove_columns",
        [['u']],
        {},
        []
    )
    safeds_runner.save_placeholder('a2', a2)
    __gen_receiver_11 = a
    v = safeds_runner.memoized_dynamic_call(
        __gen_receiver_11,
        "get_column",
        ['b'],
        {},
        []
    )
    safeds_runner.save_placeholder('v', v)
    __gen_receiver_12 = v
    d = safeds_runner.memoized_dynamic_call(
        __gen_receiver_12,
        "plot_histogram",
        [],
        {},
        []
    )
    safeds_runner.save_placeholder('d', d)
    __gen_receiver_13 = a
    __gen_receiver_14 = safeds_runner.memoized_dynamic_call(
        __gen_receiver_13,
        "get_column",
        ['b'],
        {},
        []
    )
    p = safeds_runner.memoized_dynamic_call(
        __gen_receiver_14,
        "plot_histogram",
        [],
        {},
        []
    )
    safeds_runner.save_placeholder('p', p)
    __gen_receiver_15 = a
    __gen_receiver_16 = safeds_runner.memoized_dynamic_call(
        __gen_receiver_15,
        "get_column",
        ['b'],
        {},
        []
    )
    __gen_receiver_17 = safeds_runner.memoized_dynamic_call(
        __gen_receiver_16,
        "plot_histogram",
        [],
        {},
        []
    )
    r = safeds_runner.memoized_dynamic_call(
        __gen_receiver_17,
        "flip_vertically",
        [],
        {},
        []
    )
    safeds_runner.save_placeholder('r', r)
    __gen_receiver_18 = a
    __gen_receiver_19 = safeds_runner.memoized_dynamic_call(
        __gen_receiver_18,
        "get_column",
        ['b'],
        {},
        []
    )
    __gen_receiver_20 = safeds_runner.memoized_dynamic_call(
        __gen_receiver_19,
        "plot_histogram",
        [],
        {},
        []
    )
    __gen_receiver_21 = safeds_runner.memoized_dynamic_call(
        __gen_receiver_20,
        "flip_vertically",
        [],
        {},
        []
    )
    q = safeds_runner.memoized_dynamic_call(
        __gen_receiver_21,
        "adjust_contrast",
        [1.2],
        {},
        []
    )
    safeds_runner.save_placeholder('q', q)
    f(d)
    f(p)
    f(r)
    f(q)
    f(safeds_runner.memoized_static_call(
        "tests.generator.memberAccessWithRunnerIntegration.Outer.Nested.f",
        Outer.Nested.f,
        [],
        {},
        []
    ))
    nestedInstance = safeds_runner.memoized_static_call(
        "tests.generator.memberAccessWithRunnerIntegration.factoryNested",
        factoryNested,
        [],
        {},
        []
    )
    safeds_runner.save_placeholder('nestedInstance', nestedInstance)
    __gen_receiver_22 = nestedInstance
    nestedResult = safeds_runner.memoized_dynamic_call(
        __gen_receiver_22,
        "g",
        [],
        {},
        []
    )
    safeds_runner.save_placeholder('nestedResult', nestedResult)
    f(nestedResult)
    __gen_receiver_23 = safeds_runner.memoized_static_call(
        "safeds.data.tabular.transformation.OneHotEncoder",
        OneHotEncoder,
        [],
        {},
        []
    )
    encoder = safeds_runner.memoized_dynamic_call(
        __gen_receiver_23,
        "fit",
        [a, ['b']],
        {},
        []
    )
    safeds_runner.save_placeholder('encoder', encoder)
    __gen_receiver_24 = encoder
    transformedTable = safeds_runner.memoized_dynamic_call(
        __gen_receiver_24,
        "transform",
        [a],
        {},
        []
    )
    safeds_runner.save_placeholder('transformedTable', transformedTable)
