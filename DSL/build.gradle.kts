import de.unibonn.simpleml.xtextConfiguration.code
import de.unibonn.simpleml.xtextConfiguration.configuration
import de.unibonn.simpleml.xtextConfiguration.directoryCleaner
import de.unibonn.simpleml.xtextConfiguration.ecoreGenerator
import de.unibonn.simpleml.xtextConfiguration.execute
import de.unibonn.simpleml.xtextConfiguration.project
import de.unibonn.simpleml.xtextConfiguration.projectMapping
import de.unibonn.simpleml.xtextConfiguration.standaloneSetup
import de.unibonn.simpleml.xtextConfiguration.standardLanguage
import de.unibonn.simpleml.xtextConfiguration.workflow
import de.unibonn.simpleml.xtextConfiguration.xtextGenerator
import org.eclipse.xtext.xtext.generator.formatting.Formatter2Fragment2
import org.eclipse.xtext.xtext.generator.generator.GeneratorFragment2
import org.eclipse.xtext.xtext.generator.junit.JUnitFragment
import org.eclipse.xtext.xtext.generator.model.project.BundleProjectConfig
import org.eclipse.xtext.xtext.generator.model.project.RuntimeProjectConfig
import org.eclipse.xtext.xtext.generator.serializer.SerializerFragment2
import org.eclipse.xtext.xtext.generator.validation.ValidatorFragment2

// Plugins -------------------------------------------------------------------------------------------------------------

plugins {
    kotlin("jvm") version "1.6.21" apply false
    id("com.github.node-gradle.node") version "3.2.1" apply false

    base
    idea
    id("org.jetbrains.kotlinx.kover") version "0.5.1"
}

repositories {
    mavenCentral()
}

idea {
    module {
        excludeDirs.add(file("gradle"))
    }
}

kover {
    coverageEngine.set(kotlinx.kover.api.CoverageEngine.INTELLIJ)
    intellijEngineVersion.set("1.0.669")
    this.disabledProjects = setOf(
        "Simple-ML.DSL",
        "de.unibonn.simpleml.vscode"
    )
}

val koverExcludes = listOf(
    "de.unibonn.simpleml.parser.antlr.*",
    "de.unibonn.simpleml.serializer.AbstractSimpleMLSemanticSequencer",
    "de.unibonn.simpleml.serializer.AbstractSimpleMLSyntacticSequencer",
    "de.unibonn.simpleml.services.*",
    "de.unibonn.simpleml.simpleML.*",
    "de.unibonn.simpleml.testing.*",
    "de.unibonn.simpleml.ide.contentassist.antlr.*"
)

// Variables -----------------------------------------------------------------------------------------------------------

val javaVersion by extra(17)
val xtextVersion by extra("2.27.0")

// Subprojects ---------------------------------------------------------------------------------------------------------

subprojects {
    group = "de.unibonn.simpleml"
    version = "1.0.0-SNAPSHOT"

    repositories {
        mavenCentral()
    }
}

// Tasks ---------------------------------------------------------------------------------------------------------------

tasks.register("generateXtextLanguage") {
    val rootPath = this.project.rootDir.path

    group = "Build"
    description = "Generate language files (e.g. EMF classes)"

    outputs.cacheIf { true }

    inputs.files(
        "$rootPath/de.unibonn.simpleml/model/SimpleML.ecore",
        "$rootPath/de.unibonn.simpleml/model/SimpleML.genmodel",
        "$rootPath/de.unibonn.simpleml/src/main/kotlin/de/unibonn/simpleml/SimpleML.xtext"
    )
    outputs.dirs(
        "$rootPath/de.unibonn.simpleml/META-INF",
        "$rootPath/de.unibonn.simpleml/emf-gen",
        "$rootPath/de.unibonn.simpleml/src-gen",
        "$rootPath/de.unibonn.simpleml.ide/src-gen",
        "$rootPath/de.unibonn.simpleml.tests"
    )
    outputs.files(
        "$rootPath/de.unibonn.simpleml/build.properties",
        "$rootPath/de.unibonn.simpleml/plugin.properties",
        "$rootPath/de.unibonn.simpleml/plugin.xml"
    )

    doFirst {
        workflow {
            standaloneSetup {
                setPlatformUri(rootPath)
                setScanClassPath(true)

                projectMapping(
                    projectName = "de.unibonn.simpleml",
                    path = "$rootPath/de.unibonn.simpleml"
                )

                projectMapping(
                    projectName = "de.unibonn.simpleml.ide",
                    path = "$rootPath/de.unibonn.simpleml.ide"
                )
            }

            directoryCleaner("$rootPath/de.unibonn.simpleml/emf-gen")

            ecoreGenerator(
                genModel = "platform:/resource/de.unibonn.simpleml/model/SimpleML.genmodel",
                srcPaths = listOf("platform:/resource/de.unibonn.simpleml/src/main/kotlin")
            )

            xtextGenerator {
                configuration {
                    project {
                        baseName = "de.unibonn.simpleml"
                        this.rootPath = rootPath

                        runtime = RuntimeProjectConfig().apply {
                            setSrc("$rootPath/de.unibonn.simpleml/src/main/kotlin")
                        }

                        genericIde = BundleProjectConfig().apply {
                            isEnabled = true
                            setSrc("$rootPath/de.unibonn.simpleml.ide/src/main/kotlin")
                        }

                        runtimeTest = BundleProjectConfig().apply {
                            isEnabled = false
                        }

                        isCreateEclipseMetaData = false
                    }

                    code {
                        encoding = "UTF-8"
                        lineDelimiter = "\n"
                        fileHeader = "/*\n * generated by Xtext \${version}\n */"
                        isPreferXtendStubs = true
                    }
                }

                standardLanguage {
                    setName("de.unibonn.simpleml.SimpleML")
                    setFileExtensions("smlflow,smlstub,smltest")
                    addReferencedResource("platform:/resource/de.unibonn.simpleml/model/SimpleML.genmodel")

                    setFormatter(
                        Formatter2Fragment2().apply {
                            isGenerateStub = true
                        }
                    )

                    setGenerator(
                        GeneratorFragment2().apply {
                            isGenerateXtendMain = false
                        }
                    )

                    setSerializer(
                        SerializerFragment2().apply {
                            isGenerateStub = true
                        }
                    )

                    setValidator(
                        ValidatorFragment2().apply {
                            isGenerateDeprecationValidation = true
                        }
                    )

                    setJunitSupport(
                        JUnitFragment().apply {
                            setJunitVersion("5")
                            isGenerateStub = false
                        }
                    )
                }
            }
        }.execute()
    }

    doLast {
        delete(
            fileTree("$rootPath/de.unibonn.simpleml/src") {
                include("**/*.xtend")
            }
        )
        delete(
            fileTree("$rootPath/de.unibonn.simpleml.ide/src") {
                include("**/*.xtend")
            }
        )
        delete(file("$rootPath/de.unibonn.simpleml.tests"))
    }
}

tasks {
    koverMergedHtmlReport {
        excludes = koverExcludes
    }

    koverMergedXmlReport {
        excludes = koverExcludes
    }

    koverMergedVerify {
        excludes = koverExcludes
        rule {
            name = "Minimal line coverage rate in percents"
            bound {
                minValue = 80
            }
        }
    }
}
