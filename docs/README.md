# Safe-DS DSL

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/safe-ds.safe-ds)](https://marketplace.visualstudio.com/items?itemName=safe-ds.safe-ds)
[![Main](https://github.com/Safe-DS/DSL/actions/workflows/main.yml/badge.svg)](https://github.com/Safe-DS/DSL/actions/workflows/main.yml)
[![codecov](https://codecov.io/gh/Safe-DS/DSL/branch/main/graph/badge.svg?token=ma0ytglhO1)](https://codecov.io/gh/Safe-DS/DSL)
[![Documentation Status](https://readthedocs.org/projects/safe-ds-dsl/badge/?version=stable)](https://dsl.safeds.com)

Safely develop Data Science programs with a statically checked domain specific language (DSL).

## Installation

Get the latest extension for [Visual Studio Code](https://code.visualstudio.com/) from the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=safe-ds.safe-ds).

To use this extension, the [Runner](https://github.com/Safe-DS/Runner) component needs to be installed.
The runner executes pipeline code and provides further runtime information to the extension.

To install the latest runner version from pypi, run `pip install safe-ds-runner`.

After the runner has been successfully installed, the configuration for the extension may need to be adjusted.
If the `safe-ds-runner` is visible in the default path (`$PATH` on Unix systems, `%PATH%` on Windows systems),
nothing needs to be adjusted. In case it is not visible, the Safe-DS runner command (`safe-ds.runner.command`)
needs to be set to the absolute path of the runner, as seen in the image below.

![vscode-settings-safeds-runner-path.png](./img/vscode-settings-safeds-runner-path.png)

## Documentation

You can find the full documentation [here](https://dsl.safeds.com).

## Contributing

We welcome contributions from everyone. As a starting point, check the following resources:

* [Contributing page](https://github.com/Safe-DS/DSL/contribute)

If you need further help, please [use our discussion forum][forum].

[forum]: https://github.com/orgs/Safe-DS/discussions
