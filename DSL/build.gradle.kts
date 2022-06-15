import com.larsreimann.safeds.xtextConfiguration.code
import com.larsreimann.safeds.xtextConfiguration.configuration
import com.larsreimann.safeds.xtextConfiguration.directoryCleaner
import com.larsreimann.safeds.xtextConfiguration.ecoreGenerator
import com.larsreimann.safeds.xtextConfiguration.execute
import com.larsreimann.safeds.xtextConfiguration.project
import com.larsreimann.safeds.xtextConfiguration.projectMapping
import com.larsreimann.safeds.xtextConfiguration.standaloneSetup
import com.larsreimann.safeds.xtextConfiguration.standardLanguage
import com.larsreimann.safeds.xtextConfiguration.workflow
import com.larsreimann.safeds.xtextConfiguration.xtextGenerator
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
    id("com.github.node-gradle.node") version "3.3.0" apply false

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
        "Safe-DS.DSL",
        "com.larsreimann.safeds.vscode"
    )
}

val koverExcludes = listOf(
    "com.larsreimann.safeds.parser.antlr.*",
    "com.larsreimann.safeds.serializer.AbstractSafeDSSemanticSequencer",
    "com.larsreimann.safeds.serializer.AbstractSafeDSSyntacticSequencer",
    "com.larsreimann.safeds.services.*",
    "com.larsreimann.safeds.safeDS.*",
    "com.larsreimann.safeds.testing.*",
    "com.larsreimann.safeds.ide.contentassist.antlr.*"
)

// Variables -----------------------------------------------------------------------------------------------------------

val javaVersion by extra(17)
val xtextVersion by extra("2.27.0")

// Subprojects ---------------------------------------------------------------------------------------------------------

subprojects {
    group = "com.larsreimann"
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
        "$rootPath/com.larsreimann.safeds/model/SafeDS.ecore",
        "$rootPath/com.larsreimann.safeds/model/SafeDS.genmodel",
        "$rootPath/com.larsreimann.safeds/src/main/kotlin/com/larsreimann/safeds/SafeDS.xtext"
    )
    outputs.dirs(
        "$rootPath/com.larsreimann.safeds/META-INF",
        "$rootPath/com.larsreimann.safeds/emf-gen",
        "$rootPath/com.larsreimann.safeds/src-gen",
        "$rootPath/com.larsreimann.safeds.ide/src-gen",
        "$rootPath/com.larsreimann.safeds.tests"
    )
    outputs.files(
        "$rootPath/com.larsreimann.safeds/build.properties",
        "$rootPath/com.larsreimann.safeds/plugin.properties",
        "$rootPath/com.larsreimann.safeds/plugin.xml"
    )

    doFirst {
        workflow {
            standaloneSetup {
                setPlatformUri(rootPath)
                setScanClassPath(true)

                projectMapping(
                    projectName = "com.larsreimann.safeds",
                    path = "$rootPath/com.larsreimann.safeds"
                )

                projectMapping(
                    projectName = "com.larsreimann.safeds.ide",
                    path = "$rootPath/com.larsreimann.safeds.ide"
                )
            }

            directoryCleaner("$rootPath/com.larsreimann.safeds/emf-gen")

            ecoreGenerator(
                genModel = "platform:/resource/com.larsreimann.safeds/model/SafeDS.genmodel",
                srcPaths = listOf("platform:/resource/com.larsreimann.safeds/src/main/kotlin")
            )

            xtextGenerator {
                configuration {
                    project {
                        baseName = "com.larsreimann.safeds"
                        this.rootPath = rootPath

                        runtime = RuntimeProjectConfig().apply {
                            setSrc("$rootPath/com.larsreimann.safeds/src/main/kotlin")
                        }

                        genericIde = BundleProjectConfig().apply {
                            isEnabled = true
                            setSrc("$rootPath/com.larsreimann.safeds.ide/src/main/kotlin")
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
                    setName("com.larsreimann.safeds.SafeDS")
                    setFileExtensions("sdsflow,sdsstub,sdstest")
                    addReferencedResource("platform:/resource/com.larsreimann.safeds/model/SafeDS.genmodel")

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
            fileTree("$rootPath/com.larsreimann.safeds/src") {
                include("**/*.xtend")
            }
        )
        delete(
            fileTree("$rootPath/com.larsreimann.safeds.ide/src") {
                include("**/*.xtend")
            }
        )
        delete(file("$rootPath/com.larsreimann.safeds.tests"))
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
