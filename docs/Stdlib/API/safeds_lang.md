# Package `safeds.lang`

## <a name="class-Any"></a>Class `Any`

The common superclass of all classes.

**Constructor:** _Class has no constructor._

---

## <a name="class-Boolean"></a>Class `Boolean`

A truth value.

**Constructor:** _Class has no constructor._

---

## <a name="class-Float"></a>Class `Float`

A floating-point number.

**Constructor:** _Class has no constructor._

---

## <a name="class-Int"></a>Class `Int`

An integer.

**Constructor:** _Class has no constructor._

---

## <a name="class-Nothing"></a>Class `Nothing`

The common subclass of all classes.

**Constructor:** _Class has no constructor._

---

## <a name="class-Number"></a>Class `Number`

A number.

**Constructor:** _Class has no constructor._

---

## <a name="class-String"></a>Class `String`

Some text.

**Constructor:** _Class has no constructor._

## <a name="enum-AnnotationTarget"></a>Enum `AnnotationTarget`

The declaration types that can be targeted by annotations.

### Enum Variant `Annotation`

The annotation can be called on annotations.

**Parameters:** _None expected._

### Enum Variant `Attribute`

The annotation can be called on attributes.

**Parameters:** _None expected._

### Enum Variant `Class`

The annotation can be called on classes.

**Parameters:** _None expected._

### Enum Variant `CompilationUnit`

The annotation can be called on compilation units (i.e. files).

**Parameters:** _None expected._

### Enum Variant `Enum`

The annotation can be called on enums.

**Parameters:** _None expected._

### Enum Variant `EnumVariant`

The annotation can be called on enum variants.

**Parameters:** _None expected._

### Enum Variant `Function`

The annotation can be called on functions.

**Parameters:** _None expected._

### Enum Variant `Parameter`

The annotation can be called on parameters.

**Parameters:** _None expected._

### Enum Variant `Result`

The annotation can be called on results.

**Parameters:** _None expected._

### Enum Variant `Step`

The annotation can be called on steps.

**Parameters:** _None expected._

### Enum Variant `TypeParameter`

The annotation can be called on type parameters.

**Parameters:** _None expected._

### Enum Variant `Workflow`

The annotation can be called on workflows.

**Parameters:** _None expected._

## <a name="annotation-Constant"></a>Annotation `Constant`

Values assigned to this parameter must be constant.

**Valid targets:**

- Parameter

## <a name="annotation-Deprecated"></a>Annotation `Deprecated`

The declaration should no longer be used.

**Parameters:**

- `alternative: String? = null` - What to use instead.
- `reason: String? = null` - Why the declaration was deprecated.
- `sinceVersion: String? = null` - When the declaration was deprecated.
- `removalVersion: String? = null` - When the declaration will be removed.

**Valid targets:**

- Annotation
- Attribute
- Class
- Enum
- EnumVariant
- Function
- Parameter
- Result
- Step
- TypeParameter

## <a name="annotation-Description"></a>Annotation `Description`

The purpose of a declaration.

**Parameters:**

- `description: String` - The purpose of a declaration.

**Valid targets:**

- Annotation
- Attribute
- Class
- CompilationUnit
- Enum
- EnumVariant
- Function
- Parameter
- Result
- Step
- TypeParameter
- Workflow

## <a name="annotation-Experimental"></a>Annotation `Experimental`

The declaration might change without a major version bump.

**Valid targets:**

- Annotation
- Attribute
- Class
- Enum
- EnumVariant
- Function
- Parameter
- Result
- Step
- TypeParameter

## <a name="annotation-Expert"></a>Annotation `Expert`

This parameter should only be used by expert users.

**Valid targets:**

- Parameter

## <a name="annotation-NoSideEffects"></a>Annotation `NoSideEffects`

The function has no side effects.

**Valid targets:**

- Function

## <a name="annotation-Pure"></a>Annotation `Pure`

The function has no side effects and returns the same results for the same arguments.

**Valid targets:**

- Function

## <a name="annotation-PythonModule"></a>Annotation `PythonModule`

The qualified name of the corresponding Python module (default is the qualified name of the package).

**Parameters:**

- `qualifiedName: String` - The qualified name of the corresponding Python module.

**Valid targets:**

- CompilationUnit

## <a name="annotation-PythonName"></a>Annotation `PythonName`

The name of the corresponding API element in Python (default is the name of the declaration in the stubs).

**Parameters:**

- `name: String` - The name of the corresponding API element in Python.

**Valid targets:**

- Attribute
- Class
- Enum
- EnumVariant
- Function
- Parameter
- Step
- Workflow

## <a name="annotation-Repeatable"></a>Annotation `Repeatable`

The annotation can be called multiple times for the same declaration.

**Valid targets:**

- Annotation

## <a name="annotation-Since"></a>Annotation `Since`

The version in which a declaration was added.

**Parameters:**

- `version: String` - The version in which a declaration was added.

**Valid targets:**

- Annotation
- Attribute
- Class
- CompilationUnit
- Enum
- EnumVariant
- Function
- Parameter
- Result
- Step
- TypeParameter
- Workflow

## <a name="annotation-Target"></a>Annotation `Target`

The annotation can target these declaration types. If the @Target annotation is not used any declaration type can be targeted.

**Parameters:**

- `vararg targets: AnnotationTarget` - The valid targets.

**Valid targets:**

- Annotation

---

**This file was created automatically. Do not change it manually!**
