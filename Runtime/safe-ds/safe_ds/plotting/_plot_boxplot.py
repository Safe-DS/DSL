import matplotlib.pyplot as plt
import seaborn as sns
from safe_ds.data import Column


def plot_boxplot(column: Column):
    # noinspection PyProtectedMember
    for data in column._data:
        if (
            not isinstance(data, int)
            and not isinstance(data, float)
            and not isinstance(data, complex)
        ):
            raise TypeError(
                "The column contains non numerical data. Boxplots can only plot numerical data"
            )
        if not isinstance(data, int) and not isinstance(data, float):
            raise TypeError(
                "The column contains complex data. Boxplots cannot plot the imaginary part of complex "
                "data. Please provide a Column with only real numbers"
            )
    # noinspection PyProtectedMember
    sns.boxplot(data=column._data)
    plt.tight_layout()
    plt.show()
