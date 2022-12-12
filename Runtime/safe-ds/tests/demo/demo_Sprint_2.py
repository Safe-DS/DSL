import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns
from sklearn.linear_model import LinearRegression as PythonLRS

from safe_ds import plotting
from safe_ds.data import Table, SupervisedDataset
from safe_ds.regression import LinearRegression


def data_frame() -> None:
    """
    This function shows how to setup a pd.DataFrame in normal python.
    """
    df = pd.read_csv("demo_column_table.csv")
    print(df.info())


def table() -> None:
    """
        This function shows how to setup a Table in Safe-DS.
    """
    data_table = Table.from_csv("demo_column_table.csv")
    print(data_table)


def boxplot_python() -> None:
    """
        This function shows how to setup and plot a boxplot in normal python.
    """
    dataset = pd.read_csv("demo_column_table.csv")
    sns.boxplot(data=dataset)
    plt.tight_layout()
    plt.show()


def boxplot_safeds() -> None:
    """
            This function shows how to setup and plot a boxplot in safe-DS.
    """
    table_data = Table.from_csv("demo_column_table.csv")
    plotting.plot_boxplot(table_data.get_column("A"))


def histogramm_python() -> None:
    """
            This function shows how to setup and plot a histogramm in normal python.
    """
    dataset = pd.read_csv("demo_column_table.csv")
    ax = sns.histplot(data=dataset)
    ax.set_xticks(ax.get_xticks())
    ax.set_xticklabels(
        ax.get_xticklabels(), rotation=45, horizontalalignment="right"
    )
    plt.tight_layout()
    plt.show()


def histogramm_safeds() -> None:
    """
            This function shows how to setup and plot a histogramm in safe-DS.
    """
    table_data = Table.from_csv("demo_column_table.csv")
    plotting.plot_histogram(table_data.get_column("A"))


def linear_regression_python() -> None:
    """
            This function shows how to setup and use a linear regression model in normal python.
    """
    data = pd.read_csv("demo_linear_regression.csv")
    model = PythonLRS(n_jobs=-1)
    x = pd.get_dummies(data[["A", "B", "C"]])
    y = data[["T"]]
    model.fit(x, y)
    model.predict(data[["A", "B", "C"]])


def linear_regression_safeds() -> None:
    """
            This function shows how to setup and use a linear regression model in safe-DS.
    """
    data = Table.from_csv("demo_linear_regression.csv")
    sup_data: SupervisedDataset = SupervisedDataset(data, "T")
    model = LinearRegression()
    model.fit(sup_data)
    model.predict(sup_data.feature_vectors)


if __name__ == '__main__':
    """
            Please comment out, if you want to test and see any of the given demo-functions.
    """
    # data_frame()
    # table()
    # boxplot_python()
    # boxplot_safeds()
    # histogramm_python()
    # histogramm_safeds()
    # linear_regression_python()
    # linear_regression_safeds()
