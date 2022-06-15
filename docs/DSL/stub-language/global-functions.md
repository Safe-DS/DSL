# Global Functions

In order to use a method of a [class][classes] we first must get hold of an instance of this class. Global functions do not have this requirement, so they are prime candidates to implement global utility operations that exist independently of any class.

## Defining a Global Function

The syntax to define a global function is as follows:
* The keyword `fun`
* The name of the function ("loadDataset" in the following example)
* The list of _parameters_ (inputs) enclosed in parentheses and separated by commas (`(name: String)` in the following snippet). For each parameter we list the name of the parameter followed by a colon and its type.
* Optionally we can list the _results_ (outputs) after the symbol `->`. If this section is missing it means the global function does not produce results. The list of results is again enclosed in parentheses and we use commas to separate the entries. If there is exactly one result we can omit the parentheses (see `-> dataset: Dataset` in the following example). For each result we specify its name followed by a colon and its type.
* Note that global functions do **not** have a body since they are part of the [stub language][stub-language], which does not deal with implementation.

```txt
fun loadDataset(name: String) -> dataset: Dataset
```

[classes]: classes.md
[stub-language]: README.md
