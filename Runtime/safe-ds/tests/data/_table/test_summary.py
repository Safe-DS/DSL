import pandas as pd
from safe_ds.data import Table


def test_summary() -> None:
    table = Table(pd.DataFrame(data={"col1": [1, 2, 1], "col2": ["a", "b", "c"]}))

    truth = Table(pd.DataFrame(data={
        "": [
            "max",
            "min",
            "mean",
            "mode",
            "median",
            "sum",
            "variance",
            "standard deviation",
            "idness",
            "stability",
            "row count"
        ],
        "col1": [
            2.,
            1.,
            4./3,
            1.,
            1.,
            4.,
            1./3,
            table._data[0].std(),
            2./3,
            2./3,
            3.
        ],
        "col2": [
            "-",
            "-",
            "-",
            "a",
            "-",
            "-",
            "-",
            "-",
            1.0,
            1./3,
            3
        ]
    }))

    assert truth == table.summary()
