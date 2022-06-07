val javaVersion: Int by rootProject.extra
val xtextVersion: String by rootProject.extra

// Plugins -------------------------------------------------------------------------------------------------------------

plugins {
    `java-library`
    `java-test-fixtures`
    kotlin("jvm")
    idea
}

java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(javaVersion))
    }
}

idea {
    module {
        excludeDirs.add(file("META-INF"))
    }
}

// Dependencies --------------------------------------------------------------------------------------------------------

dependencies {
    api(platform("org.eclipse.xtext:xtext-dev-bom:$xtextVersion"))
    implementation("org.eclipse.xtext:org.eclipse.xtext:$xtextVersion")

    testRuntimeOnly("org.junit.jupiter:junit-jupiter-engine")
    testImplementation("org.junit.jupiter:junit-jupiter-api:5.8.2")
    testImplementation("org.junit.jupiter:junit-jupiter-params:5.8.2")
    testImplementation("org.eclipse.xtext:org.eclipse.xtext.testing:$xtextVersion")
    testImplementation("org.eclipse.xtext:org.eclipse.xtext.xbase.testing:$xtextVersion")
    testImplementation("io.kotest:kotest-assertions-core-jvm:5.3.0")

    testFixturesImplementation("org.junit.jupiter:junit-jupiter-api:5.8.2")
    testFixturesImplementation("org.eclipse.xtext:org.eclipse.xtext.testing:$xtextVersion")
    testFixturesImplementation("org.eclipse.xtext:org.eclipse.xtext.xbase.testing:$xtextVersion")
    testFixturesImplementation("io.kotest:kotest-assertions-core-jvm:5.2.3")
}

// Source sets ---------------------------------------------------------------------------------------------------------

sourceSets {
    main {
        java.srcDirs("emf-gen", "src-gen")
        resources.srcDirs("src-gen")
        resources.include(
            "**/*.smlflow",
            "**/*.smlstub",
            "**/*.tokens",
            "**/*.xtextbin"
        )
    }
}

// Tasks ---------------------------------------------------------------------------------------------------------------

val koverExcludes = listOf(
    "de.unibonn.simpleml.parser.antlr.*",
    "de.unibonn.simpleml.serializer.AbstractSimpleMLSemanticSequencer",
    "de.unibonn.simpleml.serializer.AbstractSimpleMLSyntacticSequencer",
    "de.unibonn.simpleml.services.*",
    "de.unibonn.simpleml.simpleML.*",
    "de.unibonn.simpleml.testing.*"
)

tasks {
    build {
        dependsOn(project.tasks.named("generateStdlibDocumentation"))
    }

    compileJava {
        dependsOn(rootProject.tasks.named("generateXtextLanguage"))
    }

    compileKotlin {
        dependsOn(rootProject.tasks.named("generateXtextLanguage"))
    }

    processResources {
        dependsOn(rootProject.tasks.named("generateXtextLanguage"))
    }

    clean {
        dependsOn(rootProject.tasks.named("cleanGenerateXtextLanguage"))
    }

    test {
        useJUnitPlatform()

        minHeapSize = "512m"
        maxHeapSize = "1024m"

        extensions.configure(kotlinx.kover.api.KoverTaskExtension::class) {
            excludes = koverExcludes
        }
    }

    koverHtmlReport {
        excludes = koverExcludes
    }

    koverXmlReport {
        excludes = koverExcludes
    }

    koverVerify {
        excludes = koverExcludes
        rule {
            name = "Minimal line coverage rate in percents"
            bound {
                minValue = 80
            }
        }
    }
}

tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile>().configureEach {
    kotlinOptions.freeCompilerArgs += "-opt-in=kotlin.RequiresOptIn"
}

tasks.register<JavaExec>("generateStdlibDocumentation") {
    group = "documentation"
    description = "Generate documentation for the standard library."

    val inputDirectory = project.file("src/main/resources/stdlib")
    val outputDirectory = rootProject.file("../docs/Stdlib/API").absolutePath

    inputs.dir(inputDirectory)
    outputs.dirs(outputDirectory)

    dependsOn(sourceSets.main.get().runtimeClasspath)
    classpath = sourceSets.main.get().runtimeClasspath.filter { it.exists() }
    mainClass.set("de.unibonn.simpleml.stdlibDocumentation.MainKt")
    args = listOf(outputDirectory)
}
