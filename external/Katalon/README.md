## Katalon Script

---

To use viverra in Katalon, you must do this steps:

_Create viverra keyword:_

1. Create keyword with `viverra` package name,
2. Then, create new keyword named with `ViverraService`
3. Copy the `ViverraService.groovy` file into it

_Create viverra test listener:_

1. Create test listener named `Viverra`
2. Copy the `Viverra.groovy` file into it

_Create global variable:_

1. Create global variable for `viverraCollectionID` with string type and no value
2. Create global variable for `viverraSendReport` with boolean type and `false` for the default
3. Create global variable for `viverraHost` with string type and `http://127.0.0.1:3000` for the default value

That's all

To create your test case, see the `YourTestCaseExample.groovy` file as your guidance
