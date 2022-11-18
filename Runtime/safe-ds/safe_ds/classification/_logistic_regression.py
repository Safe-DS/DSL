from sklearn.linear_model import LogisticRegression as sk_LogisticRegression
from safe_ds.data import SupervisedDataset
from safe_ds.data import Table


# noinspection PyProtectedMember
#toDo: add Documentation
class LogisticRegression:

    def __init__(self):
        self.clf = sk_LogisticRegression(random_state=0)

    def fit(self, model: SupervisedDataset):
        self.clf.fit(model._X, model._y)

#toDo: finish predict
    def predict(self, model: Table):
        self.clf.predict(model._data)
