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
    f(((1).i((__gen_receiver_0))))
    __gen_c1 = safeds_runner.memoized_static_call(
        "tests.generator.memberAccessWithRunnerIntegration.C",
        C,
        [],
        {},
        []
    )
    safeds_runner.save_placeholder('c1', __gen_c1)
    __gen_receiver_1 = __gen_c1
    f(((1).i((__gen_receiver_1))))
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
    f(((2).i()))
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
    __gen_receiver_6 = __gen_c1
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
    __gen_a = safeds_runner.memoized_static_call(
        "safeds.data.tabular.containers.Table.from_csv_file",
        Table.from_csv_file,
        [safeds_runner.absolute_path('abc.csv')],
        {},
        [safeds_runner.file_mtime('abc.csv')]
    )
    safeds_runner.save_placeholder('a', __gen_a)
    __gen_receiver_10 = safeds_runner.memoized_static_call(
        "safeds.data.tabular.containers.Table.from_csv_file",
        Table.from_csv_file,
        [safeds_runner.absolute_path('abc.csv')],
        {},
        [safeds_runner.file_mtime('abc.csv')]
    )
    __gen_a2 = safeds_runner.memoized_dynamic_call(
        __gen_receiver_10,
        "remove_columns",
        [['u']],
        {},
        []
    )
    safeds_runner.save_placeholder('a2', __gen_a2)
    __gen_receiver_11 = __gen_a
    __gen_v = safeds_runner.memoized_dynamic_call(
        __gen_receiver_11,
        "get_column",
        ['b'],
        {},
        []
    )
    safeds_runner.save_placeholder('v', __gen_v)
    __gen_receiver_12 = __gen_v
    __gen_d = safeds_runner.memoized_dynamic_call(
        __gen_receiver_12,
        "plot_histogram",
        [],
        {},
        []
    )
    safeds_runner.save_placeholder('d', __gen_d)
    __gen_receiver_13 = __gen_a
    __gen_receiver_14 = safeds_runner.memoized_dynamic_call(
        __gen_receiver_13,
        "get_column",
        ['b'],
        {},
        []
    )
    __gen_p = safeds_runner.memoized_dynamic_call(
        __gen_receiver_14,
        "plot_histogram",
        [],
        {},
        []
    )
    safeds_runner.save_placeholder('p', __gen_p)
    __gen_receiver_15 = __gen_a
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
    __gen_r = safeds_runner.memoized_dynamic_call(
        __gen_receiver_17,
        "flip_vertically",
        [],
        {},
        []
    )
    safeds_runner.save_placeholder('r', __gen_r)
    __gen_receiver_18 = __gen_a
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
    __gen_q = safeds_runner.memoized_dynamic_call(
        __gen_receiver_21,
        "adjust_contrast",
        [1.2],
        {},
        []
    )
    safeds_runner.save_placeholder('q', __gen_q)
    f(__gen_d)
    f(__gen_p)
    f(__gen_r)
    f(__gen_q)
    f(safeds_runner.memoized_static_call(
        "tests.generator.memberAccessWithRunnerIntegration.Outer.Nested.f",
        Outer.Nested.f,
        [],
        {},
        []
    ))
    __gen_nestedInstance = safeds_runner.memoized_static_call(
        "tests.generator.memberAccessWithRunnerIntegration.factoryNested",
        factoryNested,
        [],
        {},
        []
    )
    safeds_runner.save_placeholder('nestedInstance', __gen_nestedInstance)
    __gen_receiver_22 = __gen_nestedInstance
    __gen_nestedResult = safeds_runner.memoized_dynamic_call(
        __gen_receiver_22,
        "g",
        [],
        {},
        []
    )
    safeds_runner.save_placeholder('nestedResult', __gen_nestedResult)
    f(__gen_nestedResult)
    __gen_receiver_23 = safeds_runner.memoized_static_call(
        "safeds.data.tabular.transformation.OneHotEncoder",
        OneHotEncoder,
        [],
        {},
        []
    )
    __gen_encoder = safeds_runner.memoized_dynamic_call(
        __gen_receiver_23,
        "fit",
        [__gen_a, ['b']],
        {},
        []
    )
    safeds_runner.save_placeholder('encoder', __gen_encoder)
    __gen_receiver_24 = __gen_encoder
    __gen_transformedTable = safeds_runner.memoized_dynamic_call(
        __gen_receiver_24,
        "transform",
        [__gen_a],
        {},
        []
    )
    safeds_runner.save_placeholder('transformedTable', __gen_transformedTable)
