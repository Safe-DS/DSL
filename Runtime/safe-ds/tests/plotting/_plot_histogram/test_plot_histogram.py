import matplotlib.pyplot as plt
from safe_ds import plotting
from safe_ds.data import Table


def test_plot_boxplot_float(monkeypatch):
    monkeypatch.setattr(plt, "show", lambda: None)
    table = Table.from_csv("tests/resources/test_table_read_csv.csv")
    plotting.plot_histogram(table.get_column_by_name("A"))
