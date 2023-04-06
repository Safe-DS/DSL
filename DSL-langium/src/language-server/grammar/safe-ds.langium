grammar SafeDs

interface SdsModule {
    name: string;
    imports: SdsImport[];
}

entry SdsModule returns SdsModule:
    {SdsModule} 
    ('package' name=QualifiedName)?
    imports+=SdsImport*
;

interface SdsImport {
    importedNamespace: string;
    alias: SdsImportAlias;
}

SdsImport returns SdsImport:
    'import' importedNamespace=QualifiedNameWithWildcard  alias=SdsImportAlias ?
;

interface SdsImportAlias {
    name: string;
}

SdsImportAlias returns SdsImportAlias:
    'as' name=ID
;

QualifiedName returns string:
    ID ('.' ID )*
;

QualifiedNameWithWildcard returns string:
    QualifiedName ('.' '*' )?
;


terminal ID returns string:IDENTIFIER | '`' IDENTIFIER '`'  ;
terminal IDENTIFIER returns string: /[_a-zA-Z][_a-zA-Z0-9]*/;

hidden terminal WS: /\s+/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
