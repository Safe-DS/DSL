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
    f(safeds_runner.memoized_static_call("tests.generator.memberAccessWithRunnerIntegration.g", g, [], []))
    f(safeds_runner.memoized_static_call("tests.generator.memberAccessWithRunnerIntegration.h", h, [], [])[0])
    f(safeds_runner.memoized_static_call("tests.generator.memberAccessWithRunnerIntegration.h", h, [], [])[1])
    f(safeds_runner.memoized_static_call("tests.generator.memberAccessWithRunnerIntegration.C", C, [], []).a)
    f(safeds_runner.memoized_static_call("tests.generator.memberAccessWithRunnerIntegration.C", C, [], []).c)
    f(__gen_null_safe_member_access(safeds_runner.memoized_static_call("tests.generator.memberAccessWithRunnerIntegration.factory", factory, [], []), 'a'))
    f(__gen_null_safe_member_access(safeds_runner.memoized_static_call("tests.generator.memberAccessWithRunnerIntegration.factory", factory, [], []), 'c'))
    f(safeds_runner.memoized_static_call("tests.generator.memberAccessWithRunnerIntegration.C.i", lambda *_ : 1.i(safeds_runner.memoized_static_call("tests.generator.memberAccessWithRunnerIntegration.C", C, [], [])), [safeds_runner.memoized_static_call("tests.generator.memberAccessWithRunnerIntegration.C", C, [], []), 1], []))
    c1 = safeds_runner.memoized_static_call("tests.generator.memberAccessWithRunnerIntegration.C", C, [], [])
    safeds_runner.save_placeholder('c1', c1)
    f(safeds_runner.memoized_static_call("tests.generator.memberAccessWithRunnerIntegration.C.i", lambda *_ : 1.i(c1), [c1, 1], []))
    f(safeds_runner.memoized_dynamic_call(
        safeds_runner.memoized_static_call("tests.generator.memberAccessWithRunnerIntegration.C", C, [], []),
        "j",
        [123],
        {},
        []
    ))
    f(safeds_runner.memoized_dynamic_call(
        safeds_runner.memoized_static_call("tests.generator.memberAccessWithRunnerIntegration.C", C, [], []),
        "k2",
        ['abc'],
        {},
        []
    ))
    f(safeds_runner.memoized_static_call("tests.generator.memberAccessWithRunnerIntegration.C.l", lambda *_ : 2.i(), [2], []))
    f(safeds_runner.memoized_dynamic_call(
        safeds_runner.memoized_static_call("tests.generator.memberAccessWithRunnerIntegration.C", C, [], []),
        "m",
        [],
        {"param": [object Object]},
        []
    ))
    f(safeds_runner.memoized_dynamic_call(
        c1,
        "m",
        [],
        {"param": [object Object]},
        []
    ))
    f(safeds_runner.memoized_static_call("tests.generator.memberAccessWithRunnerIntegration.C.n", lambda *_ : C.n(param=213), [], []))
    f(safeds_runner.memoized_dynamic_call(
        safeds_runner.memoized_static_call("tests.generator.memberAccessWithRunnerIntegration.C.o", C.o, [], []),
        "m",
        [],
        {"param": [object Object]},
        []
    ))
    f(safeds_runner.memoized_dynamic_call(
        safeds_runner.memoized_static_call("tests.generator.memberAccessWithRunnerIntegration.C.o", C.o, [], []),
        "j",
        [213],
        {},
        []
    ))
    f(safeds_runner.memoized_dynamic_call(
        safeds_runner.memoized_static_call("tests.generator.memberAccessWithRunnerIntegration.C.p", C.p, [], []),
        "j",
        [213],
        {},
        []
    ))
    f(safeds_runner.memoized_static_call("tests.generator.memberAccessWithRunnerIntegration.C.from_csv_file", C.from_csv_file, [safeds_runner.absolute_path('abc.csv')], [safeds_runner.file_mtime('abc.csv')]))
    a = safeds_runner.memoized_static_call("safeds.data.tabular.containers.Table.from_csv_file", Table.from_csv_file, [safeds_runner.absolute_path('abc.csv')], [safeds_runner.file_mtime('abc.csv')])
    safeds_runner.save_placeholder('a', a)
    a2 = safeds_runner.memoized_dynamic_call(
        safeds_runner.memoized_static_call("safeds.data.tabular.containers.Table.from_csv_file", Table.from_csv_file, [safeds_runner.absolute_path('abc.csv')], [safeds_runner.file_mtime('abc.csv')]),
        "remove_columns",
        [['u']],
        {},
        []
    )
    safeds_runner.save_placeholder('a2', a2)
    v = safeds_runner.memoized_dynamic_call(
        a,
        "get_column",
        ['b'],
        {},
        []
    )
    safeds_runner.save_placeholder('v', v)
    d = safeds_runner.memoized_dynamic_call(
        v,
        "plot_histogram",
        [],
        {},
        []
    )
    safeds_runner.save_placeholder('d', d)
    p = safeds_runner.memoized_dynamic_call(
        safeds_runner.memoized_dynamic_call(
            a,
            "get_column",
            ['b'],
            {},
            []
        ),
        "plot_histogram",
        [],
        {},
        []
    )
    safeds_runner.save_placeholder('p', p)
    r = safeds_runner.memoized_dynamic_call(
        safeds_runner.memoized_dynamic_call(
            safeds_runner.memoized_dynamic_call(
                a,
                "get_column",
                ['b'],
                {},
                []
            ),
            "plot_histogram",
            [],
            {},
            []
        ),
        "flip_vertically",
        [],
        {},
        []
    )
    safeds_runner.save_placeholder('r', r)
    q = safeds_runner.memoized_dynamic_call(
        safeds_runner.memoized_dynamic_call(
            safeds_runner.memoized_dynamic_call(
                safeds_runner.memoized_dynamic_call(
                    a,
                    "get_column",
                    ['b'],
                    {},
                    []
                ),
                "plot_histogram",
                [],
                {},
                []
            ),
            "flip_vertically",
            [],
            {},
            []
        ),
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
    f(safeds_runner.memoized_static_call("tests.generator.memberAccessWithRunnerIntegration.Outer.Nested.f", Outer.Nested.f, [], []))
    nestedInstance = safeds_runner.memoized_static_call("tests.generator.memberAccessWithRunnerIntegration.factoryNested", factoryNested, [], [])
    safeds_runner.save_placeholder('nestedInstance', nestedInstance)
    nestedResult = safeds_runner.memoized_dynamic_call(
        nestedInstance,
        "g",
        [],
        {},
        []
    )
    safeds_runner.save_placeholder('nestedResult', nestedResult)
    f(nestedResult)
    encoder = safeds_runner.memoized_dynamic_call(
        safeds_runner.memoized_static_call("safeds.data.tabular.transformation.OneHotEncoder", OneHotEncoder, [], []),
        "fit",
        [a, ['b']],
        {},
        []
    )
    safeds_runner.save_placeholder('encoder', encoder)
    transformedTable = safeds_runner.memoized_dynamic_call(
        encoder,
        "transform",
        [a],
        {},
        []
    )
    safeds_runner.save_placeholder('transformedTable', transformedTable)
