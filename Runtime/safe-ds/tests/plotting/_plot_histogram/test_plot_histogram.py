import _pytest
import matplotlib.pyplot as plt
import pandas as pd
from safeds.plotting import histogram
from safeds.data.tabular import Table


def test_plot_histogram(monkeypatch: _pytest.monkeypatch) -> None:
    monkeypatch.setattr(plt, "show", lambda: None)
    table = Table(pd.DataFrame(data={"A": [1, 2, 3]}))
    histogram(table.get_column("A"))
