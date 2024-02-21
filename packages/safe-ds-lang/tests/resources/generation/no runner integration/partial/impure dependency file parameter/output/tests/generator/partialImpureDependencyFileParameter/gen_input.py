# Pipelines --------------------------------------------------------------------

def testPipeline():
    impureFileWrite = iFileWrite('b.txt')
    impureFileWrite2 = iFileWrite('c.txt')
    impureFileReadAgain = iFileRead('d.txt')
    result = (impureFileReadAgain) + (2)
