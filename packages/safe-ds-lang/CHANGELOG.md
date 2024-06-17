## [0.17.0](https://github.com/Safe-DS/DSL/compare/v0.16.1...v0.17.0) (2024-05-29)


### Features

* hide columns in EDA ([#1181](https://github.com/Safe-DS/DSL/issues/1181)) ([15ccaac](https://github.com/Safe-DS/DSL/commit/15ccaac13ee29c8fa9ab22da53b16bf031fd39fe)), closes [#1171](https://github.com/Safe-DS/DSL/issues/1171)
* infer column type using runner ([#1182](https://github.com/Safe-DS/DSL/issues/1182)) ([846f404](https://github.com/Safe-DS/DSL/commit/846f404f28e89399f79dd344c6d3d89a5018b2bd)), closes [#994](https://github.com/Safe-DS/DSL/issues/994)
* integrate version 0.26.0 of the `safe-ds` Python library ([#1184](https://github.com/Safe-DS/DSL/issues/1184)) ([e79de17](https://github.com/Safe-DS/DSL/commit/e79de1797eb73c05a6d8e4448b5dc0988cf61896))
* show symbol types in headings and table of contents ([#1178](https://github.com/Safe-DS/DSL/issues/1178)) ([b2f0966](https://github.com/Safe-DS/DSL/commit/b2f0966e8ca7f301d3a372c7e982b5b1552b24e7)), closes [#1164](https://github.com/Safe-DS/DSL/issues/1164)
* sort rows in EDA ([#1183](https://github.com/Safe-DS/DSL/issues/1183)) ([ddd5186](https://github.com/Safe-DS/DSL/commit/ddd51868cb4dac6990129d826c6f1e994270f4b4)), closes [#1151](https://github.com/Safe-DS/DSL/issues/1151)

## [0.16.1](https://github.com/Safe-DS/DSL/compare/v0.16.0...v0.16.1) (2024-05-17)


### Bug Fixes

* override `fit` in `Classifier` and `Regressor` ([#1176](https://github.com/Safe-DS/DSL/issues/1176)) ([7d79314](https://github.com/Safe-DS/DSL/commit/7d79314cb2004706eb70402f5bd981d7d24aec16))

## [0.16.0](https://github.com/Safe-DS/DSL/compare/v0.15.0...v0.16.0) (2024-05-16)


### Features

* eda plot view ([#1161](https://github.com/Safe-DS/DSL/issues/1161)) ([a216743](https://github.com/Safe-DS/DSL/commit/a216743b8f0d8b70f9ceae647ae46698e1a7dfad)), closes [#955](https://github.com/Safe-DS/DSL/issues/955) [#986](https://github.com/Safe-DS/DSL/issues/986)
* integrate version 0.25.0 of the `safe-ds` Python library ([#1174](https://github.com/Safe-DS/DSL/issues/1174)) ([f357c38](https://github.com/Safe-DS/DSL/commit/f357c38c28cc8eb941fa945cf5df39fedfc79683))
* prefix keywords with `^` to treat them as identifiers ([#1172](https://github.com/Safe-DS/DSL/issues/1172)) ([90bd47c](https://github.com/Safe-DS/DSL/commit/90bd47c9f51b14427bf74610fd09225b773c168f))


### Bug Fixes

* potential stack overflow when computing types of lambda parameters ([#1173](https://github.com/Safe-DS/DSL/issues/1173)) ([d89511e](https://github.com/Safe-DS/DSL/commit/d89511eb112f24ec5ae70219d6c9d683cad02c57))

## [0.15.0](https://github.com/Safe-DS/DSL/compare/v0.14.1...v0.15.0) (2024-05-09)


### Features

* adjust type cast syntax and restore old precedence ([#1158](https://github.com/Safe-DS/DSL/issues/1158)) ([07623fc](https://github.com/Safe-DS/DSL/commit/07623fc494a31e43c67b6d5808171c23cfe62d47)), closes [#1150](https://github.com/Safe-DS/DSL/issues/1150)
* disable "unused" warning for placeholders whose name starts with an underscore ([#1155](https://github.com/Safe-DS/DSL/issues/1155)) ([25781a8](https://github.com/Safe-DS/DSL/commit/25781a87740cccd5bfe8bc64ea31e3b18413672b)), closes [#1154](https://github.com/Safe-DS/DSL/issues/1154)
* give type casts the lowest precedence ([#1157](https://github.com/Safe-DS/DSL/issues/1157)) ([7549fa1](https://github.com/Safe-DS/DSL/commit/7549fa17974793b9d3af114d8b843150775b39ee)), closes [#1150](https://github.com/Safe-DS/DSL/issues/1150)
* integrate version 0.24.0 of the `safe-ds` Python library ([#1162](https://github.com/Safe-DS/DSL/issues/1162)) ([1a24a18](https://github.com/Safe-DS/DSL/commit/1a24a18875a3ed80640581ad8292e893bec4467c))
* remove warning that package is empty ([#1159](https://github.com/Safe-DS/DSL/issues/1159)) ([b13c5df](https://github.com/Safe-DS/DSL/commit/b13c5dfbe1b050620f561cde2a2cd35af0ddfc26)), closes [#1153](https://github.com/Safe-DS/DSL/issues/1153)
* suggest adding assignment if statement does nothing ([#1156](https://github.com/Safe-DS/DSL/issues/1156)) ([11c81b3](https://github.com/Safe-DS/DSL/commit/11c81b32f8a279dcc59239150cdea3fe4f75cf42)), closes [#1142](https://github.com/Safe-DS/DSL/issues/1142)

## [0.14.1](https://github.com/Safe-DS/DSL/compare/v0.14.0...v0.14.1) (2024-05-03)


### Bug Fixes

* generation of extra statements for parameters of expression lambdas ([#1137](https://github.com/Safe-DS/DSL/issues/1137)) ([4add401](https://github.com/Safe-DS/DSL/commit/4add401389abbdeea8bab7ff90fccac524bd901c)), closes [#1136](https://github.com/Safe-DS/DSL/issues/1136)

## [0.14.0](https://github.com/Safe-DS/DSL/compare/v0.13.0...v0.14.0) (2024-05-02)


### Features

* `this` expression ([#1111](https://github.com/Safe-DS/DSL/issues/1111)) ([c7bd0fa](https://github.com/Safe-DS/DSL/commit/c7bd0fa5c9e21833ec31237f2e897e4d41dced29)), closes [#1107](https://github.com/Safe-DS/DSL/issues/1107) [#1110](https://github.com/Safe-DS/DSL/issues/1110)
* allow literal types as upper bounds of type parameters ([#1102](https://github.com/Safe-DS/DSL/issues/1102)) ([c14159b](https://github.com/Safe-DS/DSL/commit/c14159be1c003f552ac8b2b37578face9e5aab30)), closes [#1081](https://github.com/Safe-DS/DSL/issues/1081)
* Check truthiness of value ([#1131](https://github.com/Safe-DS/DSL/issues/1131)) ([0b059a1](https://github.com/Safe-DS/DSL/commit/0b059a19198465acd672662d9027048026586286))
* check usages of `@PythonName` and `@PythonCall` on overriding methods ([#1100](https://github.com/Safe-DS/DSL/issues/1100)) ([3021166](https://github.com/Safe-DS/DSL/commit/302116672fbe1781ad4932af52c0f53370964499))
* partial code generation for multiple targets ([#1114](https://github.com/Safe-DS/DSL/issues/1114)) ([5461a1b](https://github.com/Safe-DS/DSL/commit/5461a1bc591a4197a159d5f2a4fb0207cbc474b5)), closes [#1079](https://github.com/Safe-DS/DSL/issues/1079)
* Stubs for `safe-ds` version 0.22.1 ([#1130](https://github.com/Safe-DS/DSL/issues/1130)) ([6f7100d](https://github.com/Safe-DS/DSL/commit/6f7100d2c4ee0a7d59d21a93443aba5bdb474429))
* various methods to work with strings ([#1112](https://github.com/Safe-DS/DSL/issues/1112)) ([b6d4f16](https://github.com/Safe-DS/DSL/commit/b6d4f16c586d7390473dea3478f2318f8130fd88)), closes [#1108](https://github.com/Safe-DS/DSL/issues/1108)
* visibility modifiers for any module member ([#1104](https://github.com/Safe-DS/DSL/issues/1104)) ([3d43d38](https://github.com/Safe-DS/DSL/commit/3d43d38fd3db9f442d5f79d5fe8bd5ce7c9dd7cf)), closes [#1083](https://github.com/Safe-DS/DSL/issues/1083)


### Bug Fixes

* also handle literal types when computing upper bound ([#1103](https://github.com/Safe-DS/DSL/issues/1103)) ([3f1ab6f](https://github.com/Safe-DS/DSL/commit/3f1ab6fe008f767f67ad5a678600441c92d55596)), closes [#1081](https://github.com/Safe-DS/DSL/issues/1081)

## [0.13.0](https://github.com/Safe-DS/DSL/compare/v0.12.0...v0.13.0) (2024-04-24)


### Features

* allow schemas in pipeline files ([#1080](https://github.com/Safe-DS/DSL/issues/1080)) ([9508178](https://github.com/Safe-DS/DSL/commit/95081780b408262085410aa51005e5749bc70c6e)), closes [#1077](https://github.com/Safe-DS/DSL/issues/1077)
* annotations `@Category` and `@Tags` ([#1061](https://github.com/Safe-DS/DSL/issues/1061)) ([e45a4c9](https://github.com/Safe-DS/DSL/commit/e45a4c97dfc05afaf03064593162c45422da5323)), closes [#1021](https://github.com/Safe-DS/DSL/issues/1021)
* check if latest runner is installed ([#1097](https://github.com/Safe-DS/DSL/issues/1097)) ([93432bb](https://github.com/Safe-DS/DSL/commit/93432bb1602a43a99d525ba08dc3076ea95ae7fb)), closes [#1096](https://github.com/Safe-DS/DSL/issues/1096)
* do not check whether optional type parameters of classes can be inferred ([#1090](https://github.com/Safe-DS/DSL/issues/1090)) ([31b8a28](https://github.com/Safe-DS/DSL/commit/31b8a2886084a654b1f5483d41faadbb37f5147f)), closes [#1084](https://github.com/Safe-DS/DSL/issues/1084) [#1084](https://github.com/Safe-DS/DSL/issues/1084)
* generate nested functions for expression lambdas ([#1062](https://github.com/Safe-DS/DSL/issues/1062)) ([f79fd61](https://github.com/Safe-DS/DSL/commit/f79fd61dbd5abcb8714535468c8b1114b18ea766))
* mark schemas as experimental ([#1089](https://github.com/Safe-DS/DSL/issues/1089)) ([09faaf0](https://github.com/Safe-DS/DSL/commit/09faaf0c58e1718c131ab0f4572f36843e6f6842)), closes [#1078](https://github.com/Safe-DS/DSL/issues/1078)
* print values via code lens ([#1072](https://github.com/Safe-DS/DSL/issues/1072)) ([f338023](https://github.com/Safe-DS/DSL/commit/f3380234b68975bc7ccfdced8bbe819ce1732d32)), closes [#1032](https://github.com/Safe-DS/DSL/issues/1032)
* run pipeline via code lens ([#1068](https://github.com/Safe-DS/DSL/issues/1068)) ([392154d](https://github.com/Safe-DS/DSL/commit/392154dbe051dd172e81904e2b2cedb39ffd47a1))
* show image via code lens ([#1071](https://github.com/Safe-DS/DSL/issues/1071)) ([bd0946b](https://github.com/Safe-DS/DSL/commit/bd0946b9707798007fd4d80283b57a8e406ff2e6)), closes [#984](https://github.com/Safe-DS/DSL/issues/984)


### Bug Fixes

* import error when exploring tables in pipelines that call segments ([#1074](https://github.com/Safe-DS/DSL/issues/1074)) ([e34b3ff](https://github.com/Safe-DS/DSL/commit/e34b3ff071863a56e312805c07aa424aa83fd794))
* pass optional arguments of memoized calls by name ([#1095](https://github.com/Safe-DS/DSL/issues/1095)) ([39d9e5a](https://github.com/Safe-DS/DSL/commit/39d9e5abcbb69f1947bd7526a39a8a913084de5e)), closes [#1087](https://github.com/Safe-DS/DSL/issues/1087)
* possible restart loop after installing the runner ([#1073](https://github.com/Safe-DS/DSL/issues/1073)) ([7206d62](https://github.com/Safe-DS/DSL/commit/7206d626a89d65c67798734a4b44dc4ffd3d128c))
* runner not shutting down when extension was closed ([#1094](https://github.com/Safe-DS/DSL/issues/1094)) ([77a0c1f](https://github.com/Safe-DS/DSL/commit/77a0c1fdf56548fe316796781a0575d516c0ba8a))
* stub for `Table.transformColumn` ([#1065](https://github.com/Safe-DS/DSL/issues/1065)) ([aa43316](https://github.com/Safe-DS/DSL/commit/aa43316d01a54aca315c0e63df495eb6e4ffc586))
* type check arguments of annotation calls ([#1060](https://github.com/Safe-DS/DSL/issues/1060)) ([09ca1cf](https://github.com/Safe-DS/DSL/commit/09ca1cfb274491a11cc1ee8b3a5b107353fe2c8d))

## [0.12.0](https://github.com/Safe-DS/DSL/compare/v0.11.0...v0.12.0) (2024-04-18)


### Features

* better error if `+` is used for string concatenation ([#1044](https://github.com/Safe-DS/DSL/issues/1044)) ([8be49c5](https://github.com/Safe-DS/DSL/commit/8be49c5852ee5b5bc9c4e935262225cfe7dc2aa4))
* collapse class/literal types in inlay hints ([#1053](https://github.com/Safe-DS/DSL/issues/1053)) ([7db2820](https://github.com/Safe-DS/DSL/commit/7db2820ce8f6d4f69d4bcfdbea93df943ea370d0)), closes [#1048](https://github.com/Safe-DS/DSL/issues/1048)
* **deps:** require latest runner (`v0.11.0`) ([#1058](https://github.com/Safe-DS/DSL/issues/1058)) ([7ae1f6b](https://github.com/Safe-DS/DSL/commit/7ae1f6b6c1c6894d683fa24dcdfe196582fba3c6))
* don't stop validation at syntax errors ([#1049](https://github.com/Safe-DS/DSL/issues/1049)) ([db0c5d7](https://github.com/Safe-DS/DSL/commit/db0c5d71aea5dfc58a8dd938a17d8afc091aca40))
* error if name of static member equals name of inherited member ([#1054](https://github.com/Safe-DS/DSL/issues/1054)) ([b8e17af](https://github.com/Safe-DS/DSL/commit/b8e17af56994291f4e7d59286fcabe4c70f43b64))
* hide classes that are only for typing from auto-completion ([#1056](https://github.com/Safe-DS/DSL/issues/1056)) ([50851d7](https://github.com/Safe-DS/DSL/commit/50851d7ec2f859c5a4efde32b2303012bf5455ef)), closes [#1026](https://github.com/Safe-DS/DSL/issues/1026)
* ignore parameter names for default values and yields ([#1059](https://github.com/Safe-DS/DSL/issues/1059)) ([dde4de0](https://github.com/Safe-DS/DSL/commit/dde4de055b39b9b1609cfa4031e3d1458a4c5918))
* ignore parameter names when type checking arguments ([#1052](https://github.com/Safe-DS/DSL/issues/1052)) ([a1e6717](https://github.com/Safe-DS/DSL/commit/a1e6717a0f6163560e4ddedcb0da162af836276d)), closes [#1046](https://github.com/Safe-DS/DSL/issues/1046)
* installer for the runner ([#1038](https://github.com/Safe-DS/DSL/issues/1038)) ([2bde594](https://github.com/Safe-DS/DSL/commit/2bde594a9ff4204f25a991463d52807f764d14e5))
* map literals are no longer experimental ([#1039](https://github.com/Safe-DS/DSL/issues/1039)) ([1d9af4b](https://github.com/Safe-DS/DSL/commit/1d9af4be0aca26c0ccb3c3321871197d4c59fd10))
* separate VS Code languages for pipeline/stub/tests ([#1043](https://github.com/Safe-DS/DSL/issues/1043)) ([8147480](https://github.com/Safe-DS/DSL/commit/8147480dab78c28619a75b22670be4afba4d04cb))
* support for examples in documentation comments ([#1045](https://github.com/Safe-DS/DSL/issues/1045)) ([3da6d6f](https://github.com/Safe-DS/DSL/commit/3da6d6fc54b9661a1b9e686297bc67bd659d9944)), closes [#1027](https://github.com/Safe-DS/DSL/issues/1027)
* updater for the runner ([#1042](https://github.com/Safe-DS/DSL/issues/1042)) ([610d45b](https://github.com/Safe-DS/DSL/commit/610d45b663026226c63c512a517b5d13a4663b2c))


### Bug Fixes

* don't sync `safe-ds.runner.command` setting ([bb57481](https://github.com/Safe-DS/DSL/commit/bb574819ed26b4a6c779687e89f9c6058dbec765))
* save all files before opening the EDA tool ([d6d0c22](https://github.com/Safe-DS/DSL/commit/d6d0c2283abc6fa0e94eac02597d3a098d74074b))
* start runner if configuration did not change after installation ([#1040](https://github.com/Safe-DS/DSL/issues/1040)) ([b4f015a](https://github.com/Safe-DS/DSL/commit/b4f015a290c528b3d47c47775bd5883ff501beed))
* substitute type parameters for lambda parameters ([#1050](https://github.com/Safe-DS/DSL/issues/1050)) ([46145dd](https://github.com/Safe-DS/DSL/commit/46145dda35030bc506331726f8515a41d23298d5)), closes [#1047](https://github.com/Safe-DS/DSL/issues/1047)

## [0.11.0](https://github.com/Safe-DS/DSL/compare/v0.10.0...v0.11.0) (2024-04-10)


### Features

* add `toFloat` methods for `Int` and `String` ([#1018](https://github.com/Safe-DS/DSL/issues/1018)) ([55a2050](https://github.com/Safe-DS/DSL/commit/55a2050563028b04d88d4c73812ad64d0d001a30))
* fine-grained control over inlay hints for parameter names ([#1016](https://github.com/Safe-DS/DSL/issues/1016)) ([2667caf](https://github.com/Safe-DS/DSL/commit/2667cafc15b53a5f11dcf29e2fc7fa14223498d8))
* messaging service ([#1004](https://github.com/Safe-DS/DSL/issues/1004)) ([dcf4ecf](https://github.com/Safe-DS/DSL/commit/dcf4ecf54fa2c05acac18013ccfc2d5f51a033e4))
* semantic highlighting of block lambda results ([#1011](https://github.com/Safe-DS/DSL/issues/1011)) ([228733c](https://github.com/Safe-DS/DSL/commit/228733c608cddfaf5145461cfa9043845b0f68f8))
* start runner in language server ([#1006](https://github.com/Safe-DS/DSL/issues/1006)) ([ef4bb6f](https://github.com/Safe-DS/DSL/commit/ef4bb6fda4699939be9a04b7a25f836ec010b2f6))
* stubs for int conversions ([#1008](https://github.com/Safe-DS/DSL/issues/1008)) ([b635f5a](https://github.com/Safe-DS/DSL/commit/b635f5a63902fab94bedbcd7cc28aaa5222878d8))
* support relative paths ([#1019](https://github.com/Safe-DS/DSL/issues/1019)) ([3d3f28d](https://github.com/Safe-DS/DSL/commit/3d3f28d27442195c3a9ab9fb836ceafd41b8e5a7))
* trigger EDA tool via code lenses ([#1010](https://github.com/Safe-DS/DSL/issues/1010)) ([eb6e4b6](https://github.com/Safe-DS/DSL/commit/eb6e4b6dec48fb64ad149b47e2b3065069d4fd99))


### Bug Fixes

* consumption of source maps ([#1005](https://github.com/Safe-DS/DSL/issues/1005)) ([ea3da87](https://github.com/Safe-DS/DSL/commit/ea3da8741d806ce58993aa8904d0c76ebc44ed2c))
* disable global EDA panel cache ([#1014](https://github.com/Safe-DS/DSL/issues/1014)) ([f888027](https://github.com/Safe-DS/DSL/commit/f8880276623d2cb7e27a5e4f43aa8c7f3b145015))
* generation of dynamic member function calls with memoization + propagating of impurity information across chained calls ([#1015](https://github.com/Safe-DS/DSL/issues/1015)) ([19015c3](https://github.com/Safe-DS/DSL/commit/19015c34f797d3760a3279ba1bccda8ffe17d9f2)), closes [#1012](https://github.com/Safe-DS/DSL/issues/1012) [#1013](https://github.com/Safe-DS/DSL/issues/1013)
* only spawn one runner process and shut it down properly ([#1009](https://github.com/Safe-DS/DSL/issues/1009)) ([2c72cee](https://github.com/Safe-DS/DSL/commit/2c72cee3d8c25d9c57309d9d33197755e833bcf9))
* show EDA tool for `TaggedTable` and `TimeSeries` ([#1017](https://github.com/Safe-DS/DSL/issues/1017)) ([ffae98a](https://github.com/Safe-DS/DSL/commit/ffae98a1e4d5aae63942d1e794c898f401374915))

## [0.10.0](https://github.com/Safe-DS/DSL/compare/v0.9.0...v0.10.0) (2024-04-06)


### Features

* add settings to enable inlay hints individually ([#992](https://github.com/Safe-DS/DSL/issues/992)) ([b0f3e62](https://github.com/Safe-DS/DSL/commit/b0f3e620fe53dd2d16616f23d6170f36009f6823))
* filter suggestions by node type ([#999](https://github.com/Safe-DS/DSL/issues/999)) ([8d22e67](https://github.com/Safe-DS/DSL/commit/8d22e67d828902fd76896a77300c9e81e23b8a4e)), closes [#998](https://github.com/Safe-DS/DSL/issues/998)
* forbid instance and static class members with same name ([#988](https://github.com/Safe-DS/DSL/issues/988)) ([7fa6fd4](https://github.com/Safe-DS/DSL/commit/7fa6fd4baaae7fabc0770025f6a48b41b3221eca))
* improved completion provider ([#997](https://github.com/Safe-DS/DSL/issues/997)) ([61e776b](https://github.com/Safe-DS/DSL/commit/61e776b97a767868635ebb9fb24de58fc14e4bdf)), closes [#41](https://github.com/Safe-DS/DSL/issues/41)
* inlay hints for inferred types of lambda parameters ([#993](https://github.com/Safe-DS/DSL/issues/993)) ([c064e0e](https://github.com/Safe-DS/DSL/commit/c064e0e4a5d081f92b791a8a96efe580b1cefa98))
* mark entire type cast as wrong if cast is impossible ([#991](https://github.com/Safe-DS/DSL/issues/991)) ([72d4e2e](https://github.com/Safe-DS/DSL/commit/72d4e2e655b77eeb8cf2ad4a8797f2ff48164468))
* profiling in EDA tool ([#954](https://github.com/Safe-DS/DSL/issues/954)) ([854122c](https://github.com/Safe-DS/DSL/commit/854122ccb154e5e12728d17540bc4f61c07a0111)), closes [#929](https://github.com/Safe-DS/DSL/issues/929)
* require `safe-ds-runner>=0.8.0,<0.9.0` ([#976](https://github.com/Safe-DS/DSL/issues/976)) ([1003e6c](https://github.com/Safe-DS/DSL/commit/1003e6c42db2f2fd8ab5f5b7fb22e7ada6240000))
* resolve name paths in `@link` tags in documentation ([#978](https://github.com/Safe-DS/DSL/issues/978)) ([b59d6f0](https://github.com/Safe-DS/DSL/commit/b59d6f09eabc2cd8efac16b99c2f0e02d7c632e9))


### Bug Fixes

* catch internal errors caused by wrong synthetic nodes created by completion provider ([#1001](https://github.com/Safe-DS/DSL/issues/1001)) ([8a6ab99](https://github.com/Safe-DS/DSL/commit/8a6ab99388894c181415e8fcb53fa2f73b764dbb))
* chained memoized calls ([#987](https://github.com/Safe-DS/DSL/issues/987)) ([df89291](https://github.com/Safe-DS/DSL/commit/df89291031ff3a449cd17c6a48ee39e4e0d943ca))
* correctly import declarations for member functions ([#983](https://github.com/Safe-DS/DSL/issues/983)) ([79f9b08](https://github.com/Safe-DS/DSL/commit/79f9b085d0ed9fbb488440452e486909e4e5228b))
* error in Python generator for assignments with class/enum variant call as RHS ([#977](https://github.com/Safe-DS/DSL/issues/977)) ([46b2bb2](https://github.com/Safe-DS/DSL/commit/46b2bb208845108ca9ff9a78260440aee994a194)), closes [#975](https://github.com/Safe-DS/DSL/issues/975)
* generation of memoized class member calls ([#982](https://github.com/Safe-DS/DSL/issues/982)) ([ed06aef](https://github.com/Safe-DS/DSL/commit/ed06aef2dc804e7b04b53876514234f2ddbf1d13))
* generation of Python imports ([#979](https://github.com/Safe-DS/DSL/issues/979)) ([f69d836](https://github.com/Safe-DS/DSL/commit/f69d83619a851f714888e7eeb49f10b38c762c99)), closes [#974](https://github.com/Safe-DS/DSL/issues/974)
* invalid Python code generated for constructor calls ([#981](https://github.com/Safe-DS/DSL/issues/981)) ([c7d006f](https://github.com/Safe-DS/DSL/commit/c7d006f0309298dc65de7a4ad732ce6e8caa2243)), closes [#980](https://github.com/Safe-DS/DSL/issues/980)
* Python generation for type casts ([#1000](https://github.com/Safe-DS/DSL/issues/1000)) ([621ab86](https://github.com/Safe-DS/DSL/commit/621ab868ee72a7c1ad4cf2b55a4fc201c770a363))

## [0.9.0](https://github.com/Safe-DS/DSL/compare/v0.8.0...v0.9.0) (2024-04-01)


### Features

* `unknown` default value of stub parameters ([#952](https://github.com/Safe-DS/DSL/issues/952)) ([78103e3](https://github.com/Safe-DS/DSL/commit/78103e34d2a9f9399733f3cc94cc665b97a2f10e)), closes [#951](https://github.com/Safe-DS/DSL/issues/951)
* `unknown` type ([#973](https://github.com/Safe-DS/DSL/issues/973)) ([4638249](https://github.com/Safe-DS/DSL/commit/4638249dbbbe0fc3875b018685d97231907ca4bd)), closes [#967](https://github.com/Safe-DS/DSL/issues/967)
* add constraints to stubs ([#953](https://github.com/Safe-DS/DSL/issues/953)) ([dc5bf3b](https://github.com/Safe-DS/DSL/commit/dc5bf3bfcb0868c74188acceac9e3b1002e618ef))
* allow any widening/narrowing type cast ([#948](https://github.com/Safe-DS/DSL/issues/948)) ([ce01628](https://github.com/Safe-DS/DSL/commit/ce01628f307554b6b43bacbfd538156497d37bef))
* checking of parameter bounds ([#925](https://github.com/Safe-DS/DSL/issues/925)) ([610604f](https://github.com/Safe-DS/DSL/commit/610604ff2692a2770d282836bcad53aa2c6c7a7a)), closes [#18](https://github.com/Safe-DS/DSL/issues/18)
* Markdown documentation generator ([#963](https://github.com/Safe-DS/DSL/issues/963)) ([77d04de](https://github.com/Safe-DS/DSL/commit/77d04dee4afc77a9a19b105ac1e4ff2ca3420791)), closes [#663](https://github.com/Safe-DS/DSL/issues/663)
* stubs for `safe-ds` library ([#950](https://github.com/Safe-DS/DSL/issues/950)) ([155b1c0](https://github.com/Safe-DS/DSL/commit/155b1c045754a349bd7b41fef758b68adc3ec42c)), closes [#926](https://github.com/Safe-DS/DSL/issues/926)
* VS Code command to dump diagnostics into a JSON file ([#928](https://github.com/Safe-DS/DSL/issues/928)) ([34fa884](https://github.com/Safe-DS/DSL/commit/34fa884299101df4d11d98dba39395cf2eda7bec)), closes [#927](https://github.com/Safe-DS/DSL/issues/927)


### Bug Fixes

* do not memoize calls containing lambdas calling segments ([#944](https://github.com/Safe-DS/DSL/issues/944)) ([114fee6](https://github.com/Safe-DS/DSL/commit/114fee68b57e12371d574d0a5f8944def7e61813))
* language server crash on startup ([#947](https://github.com/Safe-DS/DSL/issues/947)) ([9923074](https://github.com/Safe-DS/DSL/commit/99230742a81ebfc39ae9f7a889b261415f6dfc82)), closes [#945](https://github.com/Safe-DS/DSL/issues/945)
* type checking of two union types ([#949](https://github.com/Safe-DS/DSL/issues/949)) ([21fc485](https://github.com/Safe-DS/DSL/commit/21fc4850239ed4c13ef05457fcb1f6c546da6cbc))

## [0.8.0](https://github.com/Safe-DS/DSL/compare/v0.7.0...v0.8.0) (2024-02-26)


### Features

* check the runner version to be compatible ([#888](https://github.com/Safe-DS/DSL/issues/888)) ([83378a3](https://github.com/Safe-DS/DSL/commit/83378a3187f27226476630273b1b1c4445c306c5)), closes [#880](https://github.com/Safe-DS/DSL/issues/880)
* check type parameter bounds for default values and named types ([#919](https://github.com/Safe-DS/DSL/issues/919)) ([7003ea6](https://github.com/Safe-DS/DSL/commit/7003ea67c1eb8c39c0a3e2a1f841227cd8460e2a)), closes [#614](https://github.com/Safe-DS/DSL/issues/614)
* clamp default values of parameter types to upper bound ([#921](https://github.com/Safe-DS/DSL/issues/921)) ([76ad869](https://github.com/Safe-DS/DSL/commit/76ad8694ef5748c6f28970064f50dd27a39e9c0b))
* compute highest common subtype ([#901](https://github.com/Safe-DS/DSL/issues/901)) ([5630a9f](https://github.com/Safe-DS/DSL/commit/5630a9ff272ec92a1573c12fb5047608bf70bdf9)), closes [#860](https://github.com/Safe-DS/DSL/issues/860)
* compute type parameters for calls ([#920](https://github.com/Safe-DS/DSL/issues/920)) ([35dc826](https://github.com/Safe-DS/DSL/commit/35dc826c3949bce23d4a6af2ba0e45ff7df1de35)), closes [#861](https://github.com/Safe-DS/DSL/issues/861)
* consider nullability of upper type parameter bound in various checks ([#892](https://github.com/Safe-DS/DSL/issues/892)) ([940515a](https://github.com/Safe-DS/DSL/commit/940515a6ca1633b4af407d56079057fb1bf9d71f))
* constraints for segments ([#911](https://github.com/Safe-DS/DSL/issues/911)) ([e57f886](https://github.com/Safe-DS/DSL/commit/e57f886f83a2b926bc13efb09b57356e7d0ed4cb)), closes [#903](https://github.com/Safe-DS/DSL/issues/903)
* EDA on pipeline Tables ([#834](https://github.com/Safe-DS/DSL/issues/834)) ([f42c9aa](https://github.com/Safe-DS/DSL/commit/f42c9aa5c8fcf5654c21c7819bedc252c832f883))
* error if parent type is nullable ([#891](https://github.com/Safe-DS/DSL/issues/891)) ([add650d](https://github.com/Safe-DS/DSL/commit/add650dd8864770bb1b6e24c24c34e7a97c43217))
* escape characters in string conversion of string constants ([#908](https://github.com/Safe-DS/DSL/issues/908)) ([72a9c3c](https://github.com/Safe-DS/DSL/commit/72a9c3c0ccf8cbb384707a6c1f3ba5d1166e1222)), closes [#904](https://github.com/Safe-DS/DSL/issues/904)
* format upper bound of type parameters ([#898](https://github.com/Safe-DS/DSL/issues/898)) ([9d6ce28](https://github.com/Safe-DS/DSL/commit/9d6ce282c7f0fcc7bd6fed71d8cd446362ebca7f))
* handle invariant/covariant type parameters when computing lowest common supertype ([#868](https://github.com/Safe-DS/DSL/issues/868)) ([4d6cb4e](https://github.com/Safe-DS/DSL/commit/4d6cb4ef6fa7c8f9aedbbc525b82150b2689092b)), closes [#860](https://github.com/Safe-DS/DSL/issues/860) [#861](https://github.com/Safe-DS/DSL/issues/861)
* improve handling of subclasses of lists/maps ([#890](https://github.com/Safe-DS/DSL/issues/890)) ([bb0c94b](https://github.com/Safe-DS/DSL/commit/bb0c94b4cce56762dab496daff29ad7bce15cf9f))
* improvements to constraints ([#896](https://github.com/Safe-DS/DSL/issues/896)) ([b81bef9](https://github.com/Safe-DS/DSL/commit/b81bef9c3a530a05157a965890b7ff068381b800)), closes [#18](https://github.com/Safe-DS/DSL/issues/18) [#860](https://github.com/Safe-DS/DSL/issues/860) [#18](https://github.com/Safe-DS/DSL/issues/18)
* include enum name in string conversion of enum variant types ([#907](https://github.com/Safe-DS/DSL/issues/907)) ([1f6502e](https://github.com/Safe-DS/DSL/commit/1f6502e9253747bd4154451255fb22dc8cfbbe52)), closes [#902](https://github.com/Safe-DS/DSL/issues/902)
* scoping for member accesses if receiver has type parameter type ([#889](https://github.com/Safe-DS/DSL/issues/889)) ([1277bd1](https://github.com/Safe-DS/DSL/commit/1277bd1f5efe4cf9532d03b656d26b026428b461))
* shorter message if runner is started but files have errors ([#912](https://github.com/Safe-DS/DSL/issues/912)) ([b611b44](https://github.com/Safe-DS/DSL/commit/b611b4461d7a0f3003587faa5db159b794baf899)), closes [#910](https://github.com/Safe-DS/DSL/issues/910)
* simplify union types containing type parameter types disregarding entry order ([#894](https://github.com/Safe-DS/DSL/issues/894)) ([cf6e77e](https://github.com/Safe-DS/DSL/commit/cf6e77e120d5572e83205c1c516451b4740f71ec))
* singular type is its own lowest common supertype ([#893](https://github.com/Safe-DS/DSL/issues/893)) ([79d611d](https://github.com/Safe-DS/DSL/commit/79d611d3800b61b5c6c4bb78b91afb76055b902a))
* substitute type parameter when type checking calls ([#923](https://github.com/Safe-DS/DSL/issues/923)) ([2e09306](https://github.com/Safe-DS/DSL/commit/2e0930683607f375b051c6d65cf0473579e5ede0)), closes [#915](https://github.com/Safe-DS/DSL/issues/915)
* substitute type parameters when checking overridden members ([#922](https://github.com/Safe-DS/DSL/issues/922)) ([0e657cf](https://github.com/Safe-DS/DSL/commit/0e657cf81e20965640a840c09562224e5eee3802)), closes [#917](https://github.com/Safe-DS/DSL/issues/917)
* update to `safe-ds-runner` v0.7.0 ([#906](https://github.com/Safe-DS/DSL/issues/906)) ([070f406](https://github.com/Safe-DS/DSL/commit/070f406ccbdcdc7033f8cfcdb1111ca8dd192166))
* use bounds of type system where possible ([#899](https://github.com/Safe-DS/DSL/issues/899)) ([cf92762](https://github.com/Safe-DS/DSL/commit/cf92762d7fdee714f9e4e7d39080531d7b05f3fe))


### Bug Fixes

* lenient type checking involving type parameter types ([#916](https://github.com/Safe-DS/DSL/issues/916)) ([b9d3641](https://github.com/Safe-DS/DSL/commit/b9d36415f89e156aa0cf095b3460509e32bf3a46)), closes [#915](https://github.com/Safe-DS/DSL/issues/915) [#915](https://github.com/Safe-DS/DSL/issues/915)
* runner startup silent failure ([#914](https://github.com/Safe-DS/DSL/issues/914)) ([8812944](https://github.com/Safe-DS/DSL/commit/88129448ed984d86fb8fd9f431e7a6228e59ca4d)), closes [#909](https://github.com/Safe-DS/DSL/issues/909)
* save dirty files before running pipeline ([#918](https://github.com/Safe-DS/DSL/issues/918)) ([4302ca6](https://github.com/Safe-DS/DSL/commit/4302ca650361ad1c4bc30464ea63892d9276336d))
* simplification of union types ([#897](https://github.com/Safe-DS/DSL/issues/897)) ([4c577a3](https://github.com/Safe-DS/DSL/commit/4c577a3effe0b7fe4fcd9dc4f5e0f8c935129ff5))

## [0.7.0](https://github.com/Safe-DS/DSL/compare/v0.6.0...v0.7.0) (2024-02-12)


### Features

* apply type parameter substitutions of receiver type for member accesses ([#859](https://github.com/Safe-DS/DSL/issues/859)) ([5780ed7](https://github.com/Safe-DS/DSL/commit/5780ed7e900dfb235122d924ac0a3acc6c67e9f4)), closes [#23](https://github.com/Safe-DS/DSL/issues/23)
* check position of usages of variant type parameters ([#852](https://github.com/Safe-DS/DSL/issues/852)) ([a2672d7](https://github.com/Safe-DS/DSL/commit/a2672d7e465ba00b9e17e5318e559a301b13fc6c)), closes [#743](https://github.com/Safe-DS/DSL/issues/743)
* check whether lower and upper bounds of a type parameter are compatible ([#885](https://github.com/Safe-DS/DSL/issues/885)) ([2fc7fe6](https://github.com/Safe-DS/DSL/commit/2fc7fe6e43a606a3e76cf3a5eeebf48c68c13e47)), closes [#875](https://github.com/Safe-DS/DSL/issues/875)
* check whether type parameter bounds are acyclic ([#886](https://github.com/Safe-DS/DSL/issues/886)) ([bcf1a4b](https://github.com/Safe-DS/DSL/commit/bcf1a4b8fc2cd8119ca1f13b3afd3c7208f5a879)), closes [#874](https://github.com/Safe-DS/DSL/issues/874)
* check whether type parameter bounds are named types ([#878](https://github.com/Safe-DS/DSL/issues/878)) ([d8b4168](https://github.com/Safe-DS/DSL/commit/d8b4168fddba7f56e4a66cae8cab0e11b4e4e16b)), closes [#876](https://github.com/Safe-DS/DSL/issues/876)
* error if type parameter has multiple lower/upper bounds ([#870](https://github.com/Safe-DS/DSL/issues/870)) ([6035b76](https://github.com/Safe-DS/DSL/commit/6035b76f842913f3ade7caa7730116013c4b7a4c)), closes [#867](https://github.com/Safe-DS/DSL/issues/867)
* error if type parameter of class is used in static context ([#830](https://github.com/Safe-DS/DSL/issues/830)) ([d5cf420](https://github.com/Safe-DS/DSL/commit/d5cf4203d0a75596f506ec2a20582c72f3d7af38)), closes [#809](https://github.com/Safe-DS/DSL/issues/809)
* error if type parameters of functions are variant ([#869](https://github.com/Safe-DS/DSL/issues/869)) ([9bf5fec](https://github.com/Safe-DS/DSL/commit/9bf5fec9c49b8d038cd4f7dd2d727db2cb941feb))
* handle type parameter types in type checker ([#884](https://github.com/Safe-DS/DSL/issues/884)) ([6b6f738](https://github.com/Safe-DS/DSL/commit/6b6f73824a7e7fd174402427af39f247baa4fafa)), closes [#877](https://github.com/Safe-DS/DSL/issues/877)
* handle type parameters (part 1) ([#856](https://github.com/Safe-DS/DSL/issues/856)) ([8a35558](https://github.com/Safe-DS/DSL/commit/8a35558ac9db8aac181ac3f9b80966d59656f805)), closes [#23](https://github.com/Safe-DS/DSL/issues/23)
* improve type simplification ([#871](https://github.com/Safe-DS/DSL/issues/871)) ([0daafb9](https://github.com/Safe-DS/DSL/commit/0daafb994d220f702149337941dd67f2ca1636c8))
* Memoization ([#827](https://github.com/Safe-DS/DSL/issues/827)) ([d0a6c71](https://github.com/Safe-DS/DSL/commit/d0a6c716bfbc0e14d75f2994b5645fda7ddfc758))
* null-safe call & indexed access ([#872](https://github.com/Safe-DS/DSL/issues/872)) ([f1420a2](https://github.com/Safe-DS/DSL/commit/f1420a25c60d30b101bbbd3ba6b6d8b12fc7bcae)), closes [#857](https://github.com/Safe-DS/DSL/issues/857) [#858](https://github.com/Safe-DS/DSL/issues/858)
* optional type parameters ([#829](https://github.com/Safe-DS/DSL/issues/829)) ([0e9f67a](https://github.com/Safe-DS/DSL/commit/0e9f67a67c4ee9540525b9d43eefbc99d26eafb8)), closes [#739](https://github.com/Safe-DS/DSL/issues/739)
* optionally generate code without runner integration ([#836](https://github.com/Safe-DS/DSL/issues/836)) ([0ed9d6e](https://github.com/Safe-DS/DSL/commit/0ed9d6e95bbd0d64ceef207ce06134a62f706a89)), closes [#831](https://github.com/Safe-DS/DSL/issues/831)
* pre-load all relevant workspace files before executing pipeline ([#822](https://github.com/Safe-DS/DSL/issues/822)) ([67ab766](https://github.com/Safe-DS/DSL/commit/67ab7665689b706c742f501b3a776012de6a19e9))
* simplify computed types ([#866](https://github.com/Safe-DS/DSL/issues/866)) ([bde3274](https://github.com/Safe-DS/DSL/commit/bde3274c4eee97c94a85c5b289c076471a425437))
* simplify substitutions passed to `computeType` ([#873](https://github.com/Safe-DS/DSL/issues/873)) ([aa444d4](https://github.com/Safe-DS/DSL/commit/aa444d45f9c368a39c08cc13ab706506d20b4fc4))
* substitute type parameters when checking assignability of overriding members ([#865](https://github.com/Safe-DS/DSL/issues/865)) ([a1f24e0](https://github.com/Safe-DS/DSL/commit/a1f24e02185b7371831ec9895be4db69a5c51ed0)), closes [#862](https://github.com/Safe-DS/DSL/issues/862)
* substitute type parameters when computing type of inherited members ([#864](https://github.com/Safe-DS/DSL/issues/864)) ([33de1e8](https://github.com/Safe-DS/DSL/commit/33de1e8543aa507550b6e213ebe7eacf1282bad4)), closes [#863](https://github.com/Safe-DS/DSL/issues/863)
* support placeholder queries that only request a subset of data ([#826](https://github.com/Safe-DS/DSL/issues/826)) ([1e39300](https://github.com/Safe-DS/DSL/commit/1e393006a307ce475bc7ca3d2e449e186d197855))
* type casts ([#838](https://github.com/Safe-DS/DSL/issues/838)) ([66c3666](https://github.com/Safe-DS/DSL/commit/66c3666fffe4dd042c521abb58c81158efa51950)), closes [#835](https://github.com/Safe-DS/DSL/issues/835)


### Bug Fixes

* allow usage of covariant type parameters in own constructor ([#854](https://github.com/Safe-DS/DSL/issues/854)) ([4ebae94](https://github.com/Safe-DS/DSL/commit/4ebae94ebcf1a6df69ee9e01f38601d6db4b095f))
* check for duplicate bounds if type parameters occur as right operand ([#882](https://github.com/Safe-DS/DSL/issues/882)) ([8776ce0](https://github.com/Safe-DS/DSL/commit/8776ce07ec7f5da72ba192d85bf769350546a371)), closes [#881](https://github.com/Safe-DS/DSL/issues/881)
* generation of static class functions ([#832](https://github.com/Safe-DS/DSL/issues/832)) ([57eac45](https://github.com/Safe-DS/DSL/commit/57eac45ed34fb96b9379c308718b7f2db2da0169))

## [0.6.0](https://github.com/Safe-DS/DSL/compare/v0.5.1...v0.6.0) (2024-01-15)


### Features

* CLI command to run formatting ([#824](https://github.com/Safe-DS/DSL/issues/824)) ([a74b8e0](https://github.com/Safe-DS/DSL/commit/a74b8e04ca56a5e31e854c7ebaedda5900db9de9)), closes [#702](https://github.com/Safe-DS/DSL/issues/702)
* CLI command to run validation ([#820](https://github.com/Safe-DS/DSL/issues/820)) ([7c2526d](https://github.com/Safe-DS/DSL/commit/7c2526db9ea465eba45381b5906611186f8deb57)), closes [#703](https://github.com/Safe-DS/DSL/issues/703)
* Partial execution of pipelines ([#821](https://github.com/Safe-DS/DSL/issues/821)) ([1e0d03b](https://github.com/Safe-DS/DSL/commit/1e0d03bb24a794c2a5db9382612cdf11d9e9ae88))
* python server (runtime) ([#726](https://github.com/Safe-DS/DSL/issues/726)) ([78d16f1](https://github.com/Safe-DS/DSL/commit/78d16f18f323ccce7a250fb13092ec3a177ce079)), closes [#806](https://github.com/Safe-DS/DSL/issues/806)


### Bug Fixes

* renaming of declarations that are imported under an alias ([#825](https://github.com/Safe-DS/DSL/issues/825)) ([9f7363d](https://github.com/Safe-DS/DSL/commit/9f7363de6b3c5bffc23418035b46c1db74df7edc)), closes [#635](https://github.com/Safe-DS/DSL/issues/635)
* use correct paths and module names to correctly execute Safe-DS files with spaces ([#811](https://github.com/Safe-DS/DSL/issues/811)) ([191ef33](https://github.com/Safe-DS/DSL/commit/191ef33468e83b949582dd922e9dbfd7a0318e15)), closes [#810](https://github.com/Safe-DS/DSL/issues/810)
* Wait for tree-kill during deactivation if child process does not respond ([#807](https://github.com/Safe-DS/DSL/issues/807)) ([baf4a3c](https://github.com/Safe-DS/DSL/commit/baf4a3c0e7b150d8b2eee16d83392c2d1ce16e48))

## [0.5.1](https://github.com/Safe-DS/DSL/compare/v0.5.0...v0.5.1) (2023-11-25)


### Bug Fixes

* potential stack overflow when computing impurity reasons ([#801](https://github.com/Safe-DS/DSL/issues/801)) ([1d4abb3](https://github.com/Safe-DS/DSL/commit/1d4abb367b0016aed8b2c027675832e831588687))
* stack overflow when evaluating recursive calls ([#800](https://github.com/Safe-DS/DSL/issues/800)) ([e19c817](https://github.com/Safe-DS/DSL/commit/e19c8171b967d0cc4b57b580e76773830bd49476))

## [0.5.0](https://github.com/Safe-DS/DSL/compare/v0.4.0...v0.5.0) (2023-11-25)


### Features

* error if index of indexed access is invalid ([#796](https://github.com/Safe-DS/DSL/issues/796)) ([5017759](https://github.com/Safe-DS/DSL/commit/5017759d7c03acdf854b451e7aa87509595cbe3b)), closes [#16](https://github.com/Safe-DS/DSL/issues/16)
* full implementation of partial evaluator ([#798](https://github.com/Safe-DS/DSL/issues/798)) ([7643794](https://github.com/Safe-DS/DSL/commit/76437945448305fe3dafce9aa433dce4f80ae1ce)), closes [#603](https://github.com/Safe-DS/DSL/issues/603)
* settings to hide selected warnings/infos ([#795](https://github.com/Safe-DS/DSL/issues/795)) ([ff7c23a](https://github.com/Safe-DS/DSL/commit/ff7c23a9b238886050ac896d7f6dd874eabcfbf1)), closes [#35](https://github.com/Safe-DS/DSL/issues/35)


### Bug Fixes

* handling of default values in entry point of call graph computation ([#797](https://github.com/Safe-DS/DSL/issues/797)) ([a5db23c](https://github.com/Safe-DS/DSL/commit/a5db23c74a5b1edb08e1ce8f19cbda01e39ba01a))

## [0.4.0](https://github.com/Safe-DS/DSL/compare/v0.3.0...v0.4.0) (2023-11-22)


### Features

* add endless recursion as an impurity reason ([#788](https://github.com/Safe-DS/DSL/issues/788)) ([98acdde](https://github.com/Safe-DS/DSL/commit/98acddeb1c541fa5137d29517c47fd87183e4e02))
* call graph computer (without closures) ([#782](https://github.com/Safe-DS/DSL/issues/782)) ([34bf182](https://github.com/Safe-DS/DSL/commit/34bf182f72847eafbe25dd6a24895e6f8423e0dc))
* check types of constant parameters ([#775](https://github.com/Safe-DS/DSL/issues/775)) ([0a02850](https://github.com/Safe-DS/DSL/commit/0a02850a23045d239cffec305be069aae573655f)), closes [#668](https://github.com/Safe-DS/DSL/issues/668)
* check whether purity of callable parameters of functions is set properly ([#777](https://github.com/Safe-DS/DSL/issues/777)) ([f8fd907](https://github.com/Safe-DS/DSL/commit/f8fd907d527e20daa9e6773f6ad4df0e60e971c5)), closes [#732](https://github.com/Safe-DS/DSL/issues/732)
* compute purity/side effects for expressions ([#785](https://github.com/Safe-DS/DSL/issues/785)) ([9ed1c08](https://github.com/Safe-DS/DSL/commit/9ed1c0817fdb6cc89b678c2f35d2968f82a63cb9)), closes [#15](https://github.com/Safe-DS/DSL/issues/15)
* compute types of parameters of lambdas that are passed as default value ([#780](https://github.com/Safe-DS/DSL/issues/780)) ([01a5c03](https://github.com/Safe-DS/DSL/commit/01a5c035dd133ee8cb5079a628dceefab69c95ac))
* error if call leads to infinite recursion ([#783](https://github.com/Safe-DS/DSL/issues/783)) ([f7eabd8](https://github.com/Safe-DS/DSL/commit/f7eabd86f9dd765c9c2b3afb6a13e2ff4336e171)), closes [#667](https://github.com/Safe-DS/DSL/issues/667)
* error if impure callable is passed to pure parameter ([#792](https://github.com/Safe-DS/DSL/issues/792)) ([5536a4a](https://github.com/Safe-DS/DSL/commit/5536a4a5feda272e913b63c911bf1ff3ea64cc9b)), closes [#730](https://github.com/Safe-DS/DSL/issues/730)
* error if parameter name in impurity reason is invalid ([#772](https://github.com/Safe-DS/DSL/issues/772)) ([faa2012](https://github.com/Safe-DS/DSL/commit/faa2012fa6cb3fdabc4c9067067fc4e17c35570e)), closes [#741](https://github.com/Safe-DS/DSL/issues/741)
* error if purity of functions is not specified ([#768](https://github.com/Safe-DS/DSL/issues/768)) ([a15b0af](https://github.com/Safe-DS/DSL/commit/a15b0afa535c4c8ca91ef8656fe1f71a01cbc9e9)), closes [#731](https://github.com/Safe-DS/DSL/issues/731)
* filter statements without effect for code generation ([#786](https://github.com/Safe-DS/DSL/issues/786)) ([cd4f2c1](https://github.com/Safe-DS/DSL/commit/cd4f2c1e53bb9ccd8a1a02798f9bc67ea34af94b)), closes [#542](https://github.com/Safe-DS/DSL/issues/542)
* improve location of warning about duplicate annotation target ([#771](https://github.com/Safe-DS/DSL/issues/771)) ([87d2a48](https://github.com/Safe-DS/DSL/commit/87d2a48f1c0fe89bc34b3eeacdfb313cde0bf047))
* info if `@Pure` annotation is called on parameter of pure function ([#778](https://github.com/Safe-DS/DSL/issues/778)) ([c15c70e](https://github.com/Safe-DS/DSL/commit/c15c70ebb883c6dc742a490e7a36405a51f593a4))
* purity computer ([#784](https://github.com/Safe-DS/DSL/issues/784)) ([b09bb3a](https://github.com/Safe-DS/DSL/commit/b09bb3aa0cee2f39b2b593be871c46a3092c6970))
* remove type parameters from enum variants ([#767](https://github.com/Safe-DS/DSL/issues/767)) ([cb6556a](https://github.com/Safe-DS/DSL/commit/cb6556ab825c7be3fba0d972659c7d2afa021b40)), closes [#766](https://github.com/Safe-DS/DSL/issues/766)
* short-circuit `and`, `or`, and `?:` if RHS has no side effects ([#789](https://github.com/Safe-DS/DSL/issues/789)) ([9d9f4b7](https://github.com/Safe-DS/DSL/commit/9d9f4b7f13da7c0637dfdda30645e6450b0c2bec)), closes [#15](https://github.com/Safe-DS/DSL/issues/15)
* streamline purity information ([#779](https://github.com/Safe-DS/DSL/issues/779)) ([75a9e5b](https://github.com/Safe-DS/DSL/commit/75a9e5b7534cde8a5b1316d11f52b282af900a5b))
* stricter definition of `const` parameters ([#776](https://github.com/Safe-DS/DSL/issues/776)) ([73a0d4e](https://github.com/Safe-DS/DSL/commit/73a0d4ea7d3fedded8c4e6ecdd4026eada889843))
* update snippets for functions and methods ([#769](https://github.com/Safe-DS/DSL/issues/769)) ([061d3b1](https://github.com/Safe-DS/DSL/commit/061d3b1a90a459427bd85b18822fe29749b5f675))
* validate impurity reasons of overriding methods ([#774](https://github.com/Safe-DS/DSL/issues/774)) ([71fc5bd](https://github.com/Safe-DS/DSL/commit/71fc5bdc944941ce9278113578437efd574e4fe6)), closes [#665](https://github.com/Safe-DS/DSL/issues/665)
* warn about duplicate impurity reasons ([#773](https://github.com/Safe-DS/DSL/issues/773)) ([8344356](https://github.com/Safe-DS/DSL/commit/834435685ef9194f0f6ade960d25b4905e327101)), closes [#733](https://github.com/Safe-DS/DSL/issues/733)
* warn if statement has no effect ([#787](https://github.com/Safe-DS/DSL/issues/787)) ([6f45dc4](https://github.com/Safe-DS/DSL/commit/6f45dc43433fb96d65b4ed0bb1741cb324fbecf6)), closes [#664](https://github.com/Safe-DS/DSL/issues/664)


### Bug Fixes

* signature help for optional parameters ([#793](https://github.com/Safe-DS/DSL/issues/793)) ([fd88ce8](https://github.com/Safe-DS/DSL/commit/fd88ce8955cc915b609dc9aa2ceb059eff05b2ee)), closes [#791](https://github.com/Safe-DS/DSL/issues/791)
* wrong detection of useless statements that call parameters/unknown callables ([#790](https://github.com/Safe-DS/DSL/issues/790)) ([a49b4b3](https://github.com/Safe-DS/DSL/commit/a49b4b38c5ff16916a0a4467a480291653ed54d0))
* wrong`"assignment/nothing-assigned"` error if RHS calls expression lambda ([#781](https://github.com/Safe-DS/DSL/issues/781)) ([b909cb8](https://github.com/Safe-DS/DSL/commit/b909cb8155d953b59f1ec6a2f7f180e77d642c01))

## [0.3.0](https://github.com/Safe-DS/DSL/compare/v0.2.0...v0.3.0) (2023-11-12)


### Features

* annotations for the purity of functions ([#709](https://github.com/Safe-DS/DSL/issues/709)) ([9d342e4](https://github.com/Safe-DS/DSL/commit/9d342e4d261aab5a0f1739dfaa6f8ec52a4a830a)), closes [#559](https://github.com/Safe-DS/DSL/issues/559)
* call hierarchy provider ([#735](https://github.com/Safe-DS/DSL/issues/735)) ([168d098](https://github.com/Safe-DS/DSL/commit/168d0988dfe2e5fcd9ef8be11d8b181e9a07d62f)), closes [#680](https://github.com/Safe-DS/DSL/issues/680)
* compute type of elvis operators with nullable left operand ([#715](https://github.com/Safe-DS/DSL/issues/715)) ([376b083](https://github.com/Safe-DS/DSL/commit/376b0831e87c2825b0c59b70f56b88b49815565f)), closes [#541](https://github.com/Safe-DS/DSL/issues/541)
* customize rendering of `@param`, `@result`, and `@typeParam` tags ([#764](https://github.com/Safe-DS/DSL/issues/764)) ([e049148](https://github.com/Safe-DS/DSL/commit/e0491487076c9e1d14aa749c60540c234b1e2b4a)), closes [#669](https://github.com/Safe-DS/DSL/issues/669)
* ensure an overriding member matches the overridden one ([#758](https://github.com/Safe-DS/DSL/issues/758)) ([a698a6a](https://github.com/Safe-DS/DSL/commit/a698a6aff42c6344bcf104f452718b2d0237562e)), closes [#639](https://github.com/Safe-DS/DSL/issues/639)
* error if callable type is used in wrong context ([#763](https://github.com/Safe-DS/DSL/issues/763)) ([9b1522f](https://github.com/Safe-DS/DSL/commit/9b1522f55082cc53eeaa7b48dd56f4c9b75914cc)), closes [#713](https://github.com/Safe-DS/DSL/issues/713)
* error if type parameter is used in nested named type declaration ([#750](https://github.com/Safe-DS/DSL/issues/750)) ([52374aa](https://github.com/Safe-DS/DSL/commit/52374aa2c0b168ff6b81b53a2d745ebd6303f1b9)), closes [#748](https://github.com/Safe-DS/DSL/issues/748)
* info if overriding member is not needed ([#759](https://github.com/Safe-DS/DSL/issues/759)) ([23b340e](https://github.com/Safe-DS/DSL/commit/23b340ed3206791b0fabd7950f683c3d554bc2bd)), closes [#25](https://github.com/Safe-DS/DSL/issues/25)
* mark constraint lists as experimental ([#752](https://github.com/Safe-DS/DSL/issues/752)) ([d48e1e0](https://github.com/Safe-DS/DSL/commit/d48e1e022b855173719273cfa2614cc2fa3277cf)), closes [#18](https://github.com/Safe-DS/DSL/issues/18)
* mark type parameter lists and type argument lists as experimental ([#755](https://github.com/Safe-DS/DSL/issues/755)) ([f1a052a](https://github.com/Safe-DS/DSL/commit/f1a052a74ed4dccbc4e18cb944adc8c50879c10c)), closes [#753](https://github.com/Safe-DS/DSL/issues/753)
* mark unused internal/private segments as unnecessary ([#710](https://github.com/Safe-DS/DSL/issues/710)) ([3ba8698](https://github.com/Safe-DS/DSL/commit/3ba8698189058a1b902cd35995c50bb87c260672)), closes [#682](https://github.com/Safe-DS/DSL/issues/682)
* minor improvements for purity info ([#728](https://github.com/Safe-DS/DSL/issues/728)) ([8d59607](https://github.com/Safe-DS/DSL/commit/8d59607cabfff0a16155735f506a98abaf4aa2a0))
* partially evaluate lambdas and segments ([#734](https://github.com/Safe-DS/DSL/issues/734)) ([c40347c](https://github.com/Safe-DS/DSL/commit/c40347c7d4729888d32985235d762aa7b3787877)), closes [#603](https://github.com/Safe-DS/DSL/issues/603)
* scoping for inherited members ([#706](https://github.com/Safe-DS/DSL/issues/706)) ([4518aee](https://github.com/Safe-DS/DSL/commit/4518aee4f2aba1b6a738093a1bac0b70a620dcdd)), closes [#540](https://github.com/Safe-DS/DSL/issues/540)
* scoping for member access on literals and literal types ([#754](https://github.com/Safe-DS/DSL/issues/754)) ([e60e456](https://github.com/Safe-DS/DSL/commit/e60e4563ad436b50f7585e4ad299f576715dd82d)), closes [#80](https://github.com/Safe-DS/DSL/issues/80)
* scoping for references to containing declarations ([#708](https://github.com/Safe-DS/DSL/issues/708)) ([3762c36](https://github.com/Safe-DS/DSL/commit/3762c36c310dd7a7cf7176c19f346ace686f6968)), closes [#540](https://github.com/Safe-DS/DSL/issues/540)
* show an error if a pure parameter does not have a callable type ([#736](https://github.com/Safe-DS/DSL/issues/736)) ([6c52868](https://github.com/Safe-DS/DSL/commit/6c52868762b18a9bf05575aff58bb19bc5af4542)), closes [#729](https://github.com/Safe-DS/DSL/issues/729)
* show error if own declaration has same name as core one ([#762](https://github.com/Safe-DS/DSL/issues/762)) ([8cb2120](https://github.com/Safe-DS/DSL/commit/8cb2120e157f4dcee6a3afa4737db1fdb27d0fbd)), closes [#760](https://github.com/Safe-DS/DSL/issues/760)
* signature help ([#724](https://github.com/Safe-DS/DSL/issues/724)) ([ed33676](https://github.com/Safe-DS/DSL/commit/ed33676b13dc0f38a02ba1091a7f6a111c1b8cd7)), closes [#24](https://github.com/Safe-DS/DSL/issues/24)
* Source Maps for Code Generation ([#714](https://github.com/Safe-DS/DSL/issues/714)) ([64b9e07](https://github.com/Safe-DS/DSL/commit/64b9e07b165292a30680c3ca3c7eb7b2a40b47ff)), closes [#30](https://github.com/Safe-DS/DSL/issues/30)
* tooltips for inlay hints ([#721](https://github.com/Safe-DS/DSL/issues/721)) ([3e71cad](https://github.com/Safe-DS/DSL/commit/3e71cad499a08e8be0821b530f01635c78f6b293))
* type checker service ([#722](https://github.com/Safe-DS/DSL/issues/722)) ([daad5c4](https://github.com/Safe-DS/DSL/commit/daad5c43cf1b69a77a32e9b2e0a86c86dc8c1841)), closes [#666](https://github.com/Safe-DS/DSL/issues/666)
* type checking ([#723](https://github.com/Safe-DS/DSL/issues/723)) ([a9eb3bb](https://github.com/Safe-DS/DSL/commit/a9eb3bb41990a06037b81c38b95b5a1a3a702960)), closes [#666](https://github.com/Safe-DS/DSL/issues/666)
* type checking for list & map literals ([#751](https://github.com/Safe-DS/DSL/issues/751)) ([dc14223](https://github.com/Safe-DS/DSL/commit/dc14223803696498d44c61d4d1c206da5b53ea79)), closes [#712](https://github.com/Safe-DS/DSL/issues/712)
* type hierarchy provider ([#737](https://github.com/Safe-DS/DSL/issues/737)) ([9fd5f0c](https://github.com/Safe-DS/DSL/commit/9fd5f0c5257eadc0faeb2d81b4e1718fb9657f05)), closes [#681](https://github.com/Safe-DS/DSL/issues/681)
* VS Code snippets ([#757](https://github.com/Safe-DS/DSL/issues/757)) ([fd6f432](https://github.com/Safe-DS/DSL/commit/fd6f432e8cfd1c2e0e387d96c1905c3f1d5582d1)), closes [#756](https://github.com/Safe-DS/DSL/issues/756)


### Bug Fixes

* assignability of static type to callable type ([#725](https://github.com/Safe-DS/DSL/issues/725)) ([1d17900](https://github.com/Safe-DS/DSL/commit/1d17900c45cc436691681b8f3fcb646b5aaf28fc))
* NPEs during validation ([#727](https://github.com/Safe-DS/DSL/issues/727)) ([4b8196f](https://github.com/Safe-DS/DSL/commit/4b8196ffca44b8e2fe3e22d5482fa6bac5eac0de))
* prevent overwriting core declarations ([#761](https://github.com/Safe-DS/DSL/issues/761)) ([36663ca](https://github.com/Safe-DS/DSL/commit/36663ca0c03cbf17e3386abb8d809685b628a7a5))
* prevent references to following parameters from default values ([#707](https://github.com/Safe-DS/DSL/issues/707)) ([182d64b](https://github.com/Safe-DS/DSL/commit/182d64b1e751adc1a587a0c3b0ea5c2c8c84fe2b)), closes [#540](https://github.com/Safe-DS/DSL/issues/540)
* setup of CLI ([#698](https://github.com/Safe-DS/DSL/issues/698)) ([0b5d90d](https://github.com/Safe-DS/DSL/commit/0b5d90d4a661338a63b60f759cc6422f86b4d0f9))

## [0.2.0](https://github.com/Safe-DS/DSL/compare/v0.1.0...v0.2.0) (2023-10-25)


### Features

* `const` modifier to replace `@Constant` annotation ([#618](https://github.com/Safe-DS/DSL/issues/618)) ([ea4a9ba](https://github.com/Safe-DS/DSL/commit/ea4a9bad93ee22c56dd539628c403a7fd1c3ccd7)), closes [#558](https://github.com/Safe-DS/DSL/issues/558)
* allow instance and static members of classes to have the same name ([#583](https://github.com/Safe-DS/DSL/issues/583)) ([1b04905](https://github.com/Safe-DS/DSL/commit/1b0490559bcd9fcb27a498aa0d9595bfc3e745a2))
* automatic formatting in Langium ([#526](https://github.com/Safe-DS/DSL/issues/526)) ([922af22](https://github.com/Safe-DS/DSL/commit/922af22f5b9688b1eb49fa6688f19141e8bc201c)), closes [#31](https://github.com/Safe-DS/DSL/issues/31) [#33](https://github.com/Safe-DS/DSL/issues/33) [#513](https://github.com/Safe-DS/DSL/issues/513) [#433](https://github.com/Safe-DS/DSL/issues/433)
* basic implementation of partial evaluator service ([#649](https://github.com/Safe-DS/DSL/issues/649)) ([10ed8bf](https://github.com/Safe-DS/DSL/commit/10ed8bfc2f1d9d571fcb32529e388c9a529f0147)), closes [#603](https://github.com/Safe-DS/DSL/issues/603)
* built-in library ([#557](https://github.com/Safe-DS/DSL/issues/557)) ([7998eb1](https://github.com/Safe-DS/DSL/commit/7998eb15def17d99d57682a803ae12af4ab49788)), closes [#433](https://github.com/Safe-DS/DSL/issues/433)
* check `@PythonName` and `@PythonModule` ([#641](https://github.com/Safe-DS/DSL/issues/641)) ([5a9dcbb](https://github.com/Safe-DS/DSL/commit/5a9dcbb4133462fafd7b56c180d1647347455329)), closes [#543](https://github.com/Safe-DS/DSL/issues/543)
* check context of union types ([#677](https://github.com/Safe-DS/DSL/issues/677)) ([e846b59](https://github.com/Safe-DS/DSL/commit/e846b59d3ef29e5f6a020d4c1bea8c6ee993786e)), closes [#675](https://github.com/Safe-DS/DSL/issues/675)
* check template expressions inside `@PythonCall` ([#686](https://github.com/Safe-DS/DSL/issues/686)) ([09bfb38](https://github.com/Safe-DS/DSL/commit/09bfb38c8d64e936db6ca0325b7d31bd8edd078e))
* comment provider ([#688](https://github.com/Safe-DS/DSL/issues/688)) ([e4a1b35](https://github.com/Safe-DS/DSL/commit/e4a1b356b26a83e8af13b911850a5a2299dd5fba)), closes [#669](https://github.com/Safe-DS/DSL/issues/669)
* compute types of lambdas that are passed as arguments ([#604](https://github.com/Safe-DS/DSL/issues/604)) ([25c8707](https://github.com/Safe-DS/DSL/commit/25c8707e7f7a76655b7332cdf34bd235820b5d8d)), closes [#541](https://github.com/Safe-DS/DSL/issues/541)
* document symbol provider ([#659](https://github.com/Safe-DS/DSL/issues/659)) ([fe0c8d5](https://github.com/Safe-DS/DSL/commit/fe0c8d51b1761db80b07eb51bc7d22f17d066c5f))
* documentation provider ([#689](https://github.com/Safe-DS/DSL/issues/689)) ([ff70b07](https://github.com/Safe-DS/DSL/commit/ff70b071c90a28b2d3b86488c38a5a5b3f8e0d75)), closes [#669](https://github.com/Safe-DS/DSL/issues/669)
* ensure that all assignees get a value ([#630](https://github.com/Safe-DS/DSL/issues/630)) ([e8e2bf6](https://github.com/Safe-DS/DSL/commit/e8e2bf6efba479e9bd422ad704f780492a2bcff1)), closes [#543](https://github.com/Safe-DS/DSL/issues/543)
* error if `@PythonName` and `@PythonCall` are set on a function ([#685](https://github.com/Safe-DS/DSL/issues/685)) ([d22c446](https://github.com/Safe-DS/DSL/commit/d22c4466ff595119dd5fb6d9575538549292d021))
* error if argument lists are missing ([#642](https://github.com/Safe-DS/DSL/issues/642)) ([f5ee1bd](https://github.com/Safe-DS/DSL/commit/f5ee1bd3bbab5e8e16b02d4a835038ade367051f)), closes [#543](https://github.com/Safe-DS/DSL/issues/543)
* error if class or enum are statically referenced ([#643](https://github.com/Safe-DS/DSL/issues/643)) ([8b076e7](https://github.com/Safe-DS/DSL/commit/8b076e7d67aef0a622779b166db572b6af3f3025)), closes [#543](https://github.com/Safe-DS/DSL/issues/543)
* error if divisor is zero ([#644](https://github.com/Safe-DS/DSL/issues/644)) ([9af3b81](https://github.com/Safe-DS/DSL/commit/9af3b81a2590484e9a9f17c023946c66d01cc10e)), closes [#543](https://github.com/Safe-DS/DSL/issues/543)
* error if function pointers are used ([#629](https://github.com/Safe-DS/DSL/issues/629)) ([01933b9](https://github.com/Safe-DS/DSL/commit/01933b92b1216dcffde598a41529706769db162f)), closes [#565](https://github.com/Safe-DS/DSL/issues/565) [#543](https://github.com/Safe-DS/DSL/issues/543)
* error if lambda is used in wrong context ([#647](https://github.com/Safe-DS/DSL/issues/647)) ([2d2ccc6](https://github.com/Safe-DS/DSL/commit/2d2ccc6f75f7afde655d98440b28ad1ba540ad9c)), closes [#409](https://github.com/Safe-DS/DSL/issues/409) [#543](https://github.com/Safe-DS/DSL/issues/543)
* error if left operand of type parameter constraint does not belong to declaration with constraint ([#571](https://github.com/Safe-DS/DSL/issues/571)) ([cba3abf](https://github.com/Safe-DS/DSL/commit/cba3abf75b1c9e0a4a845fea6f03c0390f0dfeff)), closes [#562](https://github.com/Safe-DS/DSL/issues/562)
* error if member access must be null safe but isn't ([#626](https://github.com/Safe-DS/DSL/issues/626)) ([077daff](https://github.com/Safe-DS/DSL/commit/077daff349b28d0f8142f3bdf3afc89bbc34cc39)), closes [#543](https://github.com/Safe-DS/DSL/issues/543)
* error if names are not unique (part 2) ([#640](https://github.com/Safe-DS/DSL/issues/640)) ([38d1181](https://github.com/Safe-DS/DSL/commit/38d11818a6f6f422838604f999731bc2314acf97)), closes [#543](https://github.com/Safe-DS/DSL/issues/543)
* error if pipeline file is in a `safeds.xy` package ([#673](https://github.com/Safe-DS/DSL/issues/673)) ([867bae3](https://github.com/Safe-DS/DSL/commit/867bae319fe3f7cf5694a5c82d2a6a502b87f888)), closes [#671](https://github.com/Safe-DS/DSL/issues/671)
* error if placeholder is alias for parameter or placeholder ([#628](https://github.com/Safe-DS/DSL/issues/628)) ([b99ab25](https://github.com/Safe-DS/DSL/commit/b99ab255a9089b8e27015eb5512888a16ca399f7)), closes [#564](https://github.com/Safe-DS/DSL/issues/564) [#543](https://github.com/Safe-DS/DSL/issues/543)
* error if simple names of builtin declarations collide ([#678](https://github.com/Safe-DS/DSL/issues/678)) ([275ad5e](https://github.com/Safe-DS/DSL/commit/275ad5e62f3180673be564c92c40d4012f4322cd)), closes [#672](https://github.com/Safe-DS/DSL/issues/672)
* error if single use annotations are used multiple times ([#631](https://github.com/Safe-DS/DSL/issues/631)) ([17a5b7a](https://github.com/Safe-DS/DSL/commit/17a5b7aca33e6518d44996f693279608a6fe0ba4)), closes [#543](https://github.com/Safe-DS/DSL/issues/543)
* error if type parameters don't have sufficient context ([#687](https://github.com/Safe-DS/DSL/issues/687)) ([ea8fe29](https://github.com/Safe-DS/DSL/commit/ea8fe29c87ee88a4b4e1fa29d243d8fc1ce78c66))
* error if value assigned to constant parameters is not constant ([#646](https://github.com/Safe-DS/DSL/issues/646)) ([097764d](https://github.com/Safe-DS/DSL/commit/097764d9dc844a78445d582fe2b0a773cb3f9bf8)), closes [#543](https://github.com/Safe-DS/DSL/issues/543)
* error if wildcard import has alias ([#574](https://github.com/Safe-DS/DSL/issues/574)) ([4ba7873](https://github.com/Safe-DS/DSL/commit/4ba787322e4ca2e56ef1962f0df7b9372bbfdf4b)), closes [#543](https://github.com/Safe-DS/DSL/issues/543)
* extensions for the `NodeMapper` ([#606](https://github.com/Safe-DS/DSL/issues/606)) ([4fd8d86](https://github.com/Safe-DS/DSL/commit/4fd8d86d2473fa7c87be074a80746830190aa3b9))
* generation ([#634](https://github.com/Safe-DS/DSL/issues/634)) ([c52b5e6](https://github.com/Safe-DS/DSL/commit/c52b5e63f71e2bf8746482217b75366eb83355c5)), closes [#542](https://github.com/Safe-DS/DSL/issues/542)
* handle backticks surrounding IDs ([#622](https://github.com/Safe-DS/DSL/issues/622)) ([608e470](https://github.com/Safe-DS/DSL/commit/608e4708f28768f0efa9285160440c62e83bf991)), closes [#579](https://github.com/Safe-DS/DSL/issues/579)
* improved TextMate grammar ([#623](https://github.com/Safe-DS/DSL/issues/623)) ([d7ff0e2](https://github.com/Safe-DS/DSL/commit/d7ff0e28b40ad2cb1a0821dc18b8862dbc1dbebe))
* info if elvis operator is unnecessary ([#645](https://github.com/Safe-DS/DSL/issues/645)) ([dcc05ce](https://github.com/Safe-DS/DSL/commit/dcc05ce10d8cb68254c9550dc804377418d58c4f)), closes [#543](https://github.com/Safe-DS/DSL/issues/543)
* info if import alias can be removed ([#637](https://github.com/Safe-DS/DSL/issues/637)) ([83936b8](https://github.com/Safe-DS/DSL/commit/83936b876a70de26dc68591d2f52526433bbeea0)), closes [#636](https://github.com/Safe-DS/DSL/issues/636)
* inlay hint provider ([#683](https://github.com/Safe-DS/DSL/issues/683)) ([f23fa29](https://github.com/Safe-DS/DSL/commit/f23fa291139976782f5419429a7f5844994ecfd7)), closes [#679](https://github.com/Safe-DS/DSL/issues/679)
* intermediate type computer ([#600](https://github.com/Safe-DS/DSL/issues/600)) ([8d68a42](https://github.com/Safe-DS/DSL/commit/8d68a42732fe8bce43b9d29d9e561a8c70906c7f)), closes [#541](https://github.com/Safe-DS/DSL/issues/541)
* Langium grammar ([#470](https://github.com/Safe-DS/DSL/issues/470)) ([c439c19](https://github.com/Safe-DS/DSL/commit/c439c19e2880b3e6218c2b1284bbd4d5e00d0d42)), closes [#433](https://github.com/Safe-DS/DSL/issues/433)
* list & map literals ([#619](https://github.com/Safe-DS/DSL/issues/619)) ([e3b2870](https://github.com/Safe-DS/DSL/commit/e3b2870933faa3e292a2e6c798a2706c87256a96)), closes [#615](https://github.com/Safe-DS/DSL/issues/615) [#616](https://github.com/Safe-DS/DSL/issues/616)
* mark union types as experimental ([#676](https://github.com/Safe-DS/DSL/issues/676)) ([4656c25](https://github.com/Safe-DS/DSL/commit/4656c253cec4f3de7e39a63c9c1bcf45c354fa75)), closes [#674](https://github.com/Safe-DS/DSL/issues/674)
* node mapper ([#602](https://github.com/Safe-DS/DSL/issues/602)) ([a13e5b5](https://github.com/Safe-DS/DSL/commit/a13e5b589b60a5e26337e18e861ed48c55a58661))
* port additional checks ([#567](https://github.com/Safe-DS/DSL/issues/567)) ([2803305](https://github.com/Safe-DS/DSL/commit/28033057738dacb9c3e486b83e28549277353526)), closes [#543](https://github.com/Safe-DS/DSL/issues/543)
* port additional validation checks to `Langium ([#576](https://github.com/Safe-DS/DSL/issues/576)) ([8f5d57a](https://github.com/Safe-DS/DSL/commit/8f5d57aa5626b2105514338424bfe972d4dd7e62)), closes [#543](https://github.com/Safe-DS/DSL/issues/543)
* port remaining validation infos that don't need partial evaluation ([#607](https://github.com/Safe-DS/DSL/issues/607)) ([d53bda3](https://github.com/Safe-DS/DSL/commit/d53bda3208d0ba709b3060af59f468aa7aae1d7f)), closes [#543](https://github.com/Safe-DS/DSL/issues/543)
* port validation of parameter lists ([#573](https://github.com/Safe-DS/DSL/issues/573)) ([bd73bc5](https://github.com/Safe-DS/DSL/commit/bd73bc571df2715f5fe3fc7e3c9eb61218596cb0)), closes [#543](https://github.com/Safe-DS/DSL/issues/543)
* Python-like import syntax ([#598](https://github.com/Safe-DS/DSL/issues/598)) ([4c61b8c](https://github.com/Safe-DS/DSL/commit/4c61b8c18a50fc89f193ebbbaa66ef1743db9ee0))
* PythonCall annotation ([#684](https://github.com/Safe-DS/DSL/issues/684)) ([15114df](https://github.com/Safe-DS/DSL/commit/15114df2179b5729423b38cfa282841681c40bde)), closes [#617](https://github.com/Safe-DS/DSL/issues/617)
* remove star projection and use-site variance ([#597](https://github.com/Safe-DS/DSL/issues/597)) ([928f487](https://github.com/Safe-DS/DSL/commit/928f487394efcd8bf695683018ed77c5e097a7c1))
* remove type arguments from calls ([#581](https://github.com/Safe-DS/DSL/issues/581)) ([3e88f02](https://github.com/Safe-DS/DSL/commit/3e88f029f1fad44f4cddbc72bb0a0e0b07eecdb0))
* resolve references to declarations in other files ([#586](https://github.com/Safe-DS/DSL/issues/586)) ([6b30de5](https://github.com/Safe-DS/DSL/commit/6b30de55255578d1fa51b567f78201469b1056ec)), closes [#540](https://github.com/Safe-DS/DSL/issues/540)
* scoping for named types ([#563](https://github.com/Safe-DS/DSL/issues/563)) ([a877f4c](https://github.com/Safe-DS/DSL/commit/a877f4c9c3154a19a65717a6bf635d3ccae7bb13)), closes [#540](https://github.com/Safe-DS/DSL/issues/540)
* scoping for own members ([#611](https://github.com/Safe-DS/DSL/issues/611)) ([43b276f](https://github.com/Safe-DS/DSL/commit/43b276fa1121ce4ba8d21ab80a145dbd4ecaa88a)), closes [#540](https://github.com/Safe-DS/DSL/issues/540)
* scoping for references to own static members ([#582](https://github.com/Safe-DS/DSL/issues/582)) ([38afc07](https://github.com/Safe-DS/DSL/commit/38afc07726b0ff05c2f1e1eac016a2d6cc7baf9b)), closes [#540](https://github.com/Safe-DS/DSL/issues/540)
* scoping for type arguments ([#585](https://github.com/Safe-DS/DSL/issues/585)) ([3da8dd0](https://github.com/Safe-DS/DSL/commit/3da8dd013c0eb98efb00624531962b1a31d4b3c4)), closes [#540](https://github.com/Safe-DS/DSL/issues/540)
* scoping of annotation calls, type parameter constraints & yields ([#561](https://github.com/Safe-DS/DSL/issues/561)) ([a510f2b](https://github.com/Safe-DS/DSL/commit/a510f2b77c9820d572e7d1fee24bdb028d9d13fd)), closes [#540](https://github.com/Safe-DS/DSL/issues/540)
* scoping of arguments ([#601](https://github.com/Safe-DS/DSL/issues/601)) ([6b486cd](https://github.com/Safe-DS/DSL/commit/6b486cd162847eaa2f607ae112fb097c7cdea4f2)), closes [#540](https://github.com/Safe-DS/DSL/issues/540)
* scoping of direct references to declarations in same file ([#580](https://github.com/Safe-DS/DSL/issues/580)) ([491d7b0](https://github.com/Safe-DS/DSL/commit/491d7b02a09bf521a741635f78bb37eccc9f1715)), closes [#540](https://github.com/Safe-DS/DSL/issues/540)
* semantic highlighting ([#653](https://github.com/Safe-DS/DSL/issues/653)) ([fe8c602](https://github.com/Safe-DS/DSL/commit/fe8c602f6aaaf7f6ea8d81c8be96342763491eef)), closes [#27](https://github.com/Safe-DS/DSL/issues/27)
* show info if unnecessary syntax is used ([#566](https://github.com/Safe-DS/DSL/issues/566)) ([c26d33a](https://github.com/Safe-DS/DSL/commit/c26d33a4b4eb12d4db76d2940aa77573886d791b)), closes [#543](https://github.com/Safe-DS/DSL/issues/543)
* show info that empty constraint lists can be removed ([#572](https://github.com/Safe-DS/DSL/issues/572)) ([af13e28](https://github.com/Safe-DS/DSL/commit/af13e28c4072e212ad1eb81910f7f1528ad6804f)), closes [#570](https://github.com/Safe-DS/DSL/issues/570)
* stop validation after lexing/parsing errors ([#662](https://github.com/Safe-DS/DSL/issues/662)) ([ba1e9a8](https://github.com/Safe-DS/DSL/commit/ba1e9a8105dca21ddc155a1939bf1228bc008cad))
* syntax and formatting for literal types ([#529](https://github.com/Safe-DS/DSL/issues/529)) ([32aca34](https://github.com/Safe-DS/DSL/commit/32aca34447bc84b4e9c584615092cab9b8767610)), closes [#80](https://github.com/Safe-DS/DSL/issues/80)
* syntax highlighting in documentation comments ([#690](https://github.com/Safe-DS/DSL/issues/690)) ([83364d3](https://github.com/Safe-DS/DSL/commit/83364d3d7a026ee46a1220023c1b583ae7a50c9a)), closes [#669](https://github.com/Safe-DS/DSL/issues/669)
* unique names withing declarations ([#575](https://github.com/Safe-DS/DSL/issues/575)) ([47ce782](https://github.com/Safe-DS/DSL/commit/47ce782857f8f8c0cd53e933cb9d826163476fba)), closes [#543](https://github.com/Safe-DS/DSL/issues/543)
* validate package of imports ([#627](https://github.com/Safe-DS/DSL/issues/627)) ([18641de](https://github.com/Safe-DS/DSL/commit/18641defc439027eb9ac802a9881836c3b205e09)), closes [#543](https://github.com/Safe-DS/DSL/issues/543)
* validation for annotation target ([#670](https://github.com/Safe-DS/DSL/issues/670)) ([fa7631d](https://github.com/Safe-DS/DSL/commit/fa7631d6c42ddb4e0302703e036f0094f7519538)), closes [#543](https://github.com/Safe-DS/DSL/issues/543)
* validation for results of segments ([#613](https://github.com/Safe-DS/DSL/issues/613)) ([bf20c7c](https://github.com/Safe-DS/DSL/commit/bf20c7c554a4c6de337a675364c86e8078544b8d)), closes [#543](https://github.com/Safe-DS/DSL/issues/543)
* validation for type arguments of named types ([#632](https://github.com/Safe-DS/DSL/issues/632)) ([b72768c](https://github.com/Safe-DS/DSL/commit/b72768c1489d6ae596ac256861bb4496b271a544)), closes [#543](https://github.com/Safe-DS/DSL/issues/543)
* value converter for strings & ints ([#655](https://github.com/Safe-DS/DSL/issues/655)) ([aafa2e3](https://github.com/Safe-DS/DSL/commit/aafa2e3acdcc88ec87090e5cc4dca5a256eb4e09))
* various checks for annotations on parameters and results ([#625](https://github.com/Safe-DS/DSL/issues/625)) ([e77037e](https://github.com/Safe-DS/DSL/commit/e77037e20dfb385d67ff8e8612e001147253c20c)), closes [#543](https://github.com/Safe-DS/DSL/issues/543)
* various checks for argument lists ([#648](https://github.com/Safe-DS/DSL/issues/648)) ([d76e597](https://github.com/Safe-DS/DSL/commit/d76e5971222bdd2ba21fc3150cc62634b461a429)), closes [#543](https://github.com/Safe-DS/DSL/issues/543)
* various checks for calls ([#638](https://github.com/Safe-DS/DSL/issues/638)) ([e0fa032](https://github.com/Safe-DS/DSL/commit/e0fa032751feabe1a51f19b43685ab53810802e8)), closes [#543](https://github.com/Safe-DS/DSL/issues/543)
* various checks related to inheritance ([#633](https://github.com/Safe-DS/DSL/issues/633)) ([7ec746a](https://github.com/Safe-DS/DSL/commit/7ec746ad4abd2630e7ec0c21b5a0a4648b0a4207)), closes [#543](https://github.com/Safe-DS/DSL/issues/543)
* various features related to literal types ([#657](https://github.com/Safe-DS/DSL/issues/657)) ([1775705](https://github.com/Safe-DS/DSL/commit/177570503ba19492091b14474999b96f956ba373)), closes [#80](https://github.com/Safe-DS/DSL/issues/80)
* very basic type computer ([#596](https://github.com/Safe-DS/DSL/issues/596)) ([b3d786c](https://github.com/Safe-DS/DSL/commit/b3d786cc8d1af7757fb2e1fc8fd2515dc4ecf57e)), closes [#541](https://github.com/Safe-DS/DSL/issues/541)
* warn if deprecated/experimental declarations are used ([#608](https://github.com/Safe-DS/DSL/issues/608)) ([9b5287c](https://github.com/Safe-DS/DSL/commit/9b5287ccee841b5cbdd10bd05d187701fc873503)), closes [#543](https://github.com/Safe-DS/DSL/issues/543) [#540](https://github.com/Safe-DS/DSL/issues/540)
* warn if experimental language features are used ([#624](https://github.com/Safe-DS/DSL/issues/624)) ([090fcc3](https://github.com/Safe-DS/DSL/commit/090fcc3d7fbb8227620a3ecaed45fc12b6de71e7)), closes [#108](https://github.com/Safe-DS/DSL/issues/108)
* warn if parameters or placeholders are unused ([#612](https://github.com/Safe-DS/DSL/issues/612)) ([3a2e9cc](https://github.com/Safe-DS/DSL/commit/3a2e9cca48fd10c6793c8c9ceaf57362e9a650e4)), closes [#543](https://github.com/Safe-DS/DSL/issues/543)
* warning if literal types or union types have duplicate entries ([#658](https://github.com/Safe-DS/DSL/issues/658)) ([9ba9d20](https://github.com/Safe-DS/DSL/commit/9ba9d20b2f576237a32f9c3b647220577bd93191))


### Bug Fixes

* CLI startup ([#560](https://github.com/Safe-DS/DSL/issues/560)) ([4bde898](https://github.com/Safe-DS/DSL/commit/4bde8983b234666acc0668093d4b107db70158ab))
* duplicate error if annotation call has no argument list and lacks required parameters ([#650](https://github.com/Safe-DS/DSL/issues/650)) ([4ba2c2c](https://github.com/Safe-DS/DSL/commit/4ba2c2cdc47655ac5234133b54354528b78b5719))
* mark map literals as experimental ([#656](https://github.com/Safe-DS/DSL/issues/656)) ([ca47870](https://github.com/Safe-DS/DSL/commit/ca4787072323a4a4dfbaab7d0fe7adc627ecbcca))
* resolution of references to declarations of wrong node type ([#599](https://github.com/Safe-DS/DSL/issues/599)) ([6ae387a](https://github.com/Safe-DS/DSL/commit/6ae387a1d1a9648e16acdc3e50cbb1fbed351f79))
