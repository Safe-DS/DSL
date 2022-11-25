from sklearn.linear_model import LogisticRegression as sk_LogisticRegression

# noinspection PyProtectedMember
import safe_ds._util._util_sklearn
from safe_ds.data import SupervisedDataset, Table


# noinspection PyProtectedMember
class LogisticRegression:
    """
    This class implements regularized logistic regression. It is used as a classifier model.
    It can only be trained on a supervised dataset.
    """

    def __init__(self):
        self._clf = sk_LogisticRegression(n_jobs=-1)

    def fit(self, supervised_dataset: SupervisedDataset):
        """
        Fit this model given a supervised dataset.

        Parameters
        ----------
        supervised_dataset: SupervisedDataset
            the supervised dataset containing the feature and target vectors

        Raises
        ------
        LearningError
            if the supervised dataset contains invalid values or if the training failed
        """
        safe_ds._util._util_sklearn.fit(self._clf, supervised_dataset)

    def predict(self, dataset: Table) -> Table:
        """
        Predict a target vector using a dataset containing feature vectors. The model has to be trained first

        Parameters
        ----------
        dataset: Table
            the dataset containing the feature vectors

        Returns
        -------
        table : Table
            a dataset containing the given feature vectors and the predicted target vector

        Raises
        ------
        PredictionError
            if predicting with the given dataset failed
        """
        return safe_ds._util._util_sklearn.predict(self._clf, dataset)
