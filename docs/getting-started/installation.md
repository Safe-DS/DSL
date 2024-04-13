# Installation

To set up a powerful _integrated development environment_ (_IDE_) for Safe-DS, follow these steps:

1. **Install [Visual Studio Code](https://code.visualstudio.com/)** (VS Code).
2. **Install the [Safe-DS extension](https://marketplace.visualstudio.com/items?itemName=safe-ds.safe-ds)** for VS Code.

To run Safe-DS programs, you also need the [Safe-DS Runner](https://github.com/Safe-DS/Runner):

1. **Install [Python](https://www.python.org/) (3.11 or 3.12)**. Make sure to add Python to your
   system's `PATH` during installation. Verify installation by running `python --version` in a
   command line. You should get output similar to `Python 3.12.2`.
2. **Open VS Code**.
3. **Open the command palette** (Menu bar > View > Command Palette).
4. **Type `Install the Safe-DS Runner`**.
5. **Press ++enter++**. Installation may take a few minutes, since it downloads and installs several large libraries
   like PyTorch.

## Updating the Safe-DS Extension

By default, VS Code automatically updates extensions. You only need to restart VS Code to apply the update.

## Updating the Safe-DS Runner

You need to update the Safe-DS Runner if you see an error message like this:

!!! failure "Error message"

    The installed runner version `0.9.0` is not compatible with this version of the extension.

    The installed version should match these requirements: `>=0.10.0,<0.11.0`. Please update to a matching version.

Click on the button "Update runner" in the error message to trigger the update process.
