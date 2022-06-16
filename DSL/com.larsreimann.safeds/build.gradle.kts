import org.jetbrains.dokka.gradle.DokkaTask

val javaVersion: Int by rootProject.extra
val xtextVersion: String by rootProject.extra

// Plugins -------------------------------------------------------------------------------------------------------------

plugins {
    idea
    `java-library`
    `java-test-fixtures`
    kotlin("jvm")
    `maven-publish`
    signing
    id("org.jetbrains.dokka")
}

val javadocJar by tasks.creating(Jar::class) {
    val dokkaHtml by tasks.getting(DokkaTask::class)
    dependsOn(dokkaHtml)
    archiveClassifier.set("javadoc")
    from(dokkaHtml.outputDirectory)
}

java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(javaVersion))
    }
    withJavadocJar()
    withSourcesJar()
}


publishing {
    publications {
        create<MavenPublication>("mavenJava") {
            artifactId = "safe-ds-core"

            val javaComponent = components["java"] as AdhocComponentWithVariants
            javaComponent.withVariantsFromConfiguration(configurations["testFixturesApiElements"]) { skip() }
            javaComponent.withVariantsFromConfiguration(configurations["testFixturesRuntimeElements"]) { skip() }
            from(javaComponent)

            pom {
                name.set("$groupId:$artifactId")
                description.set("Safely develop Data Science programs with a statically checked DSL.")
                url.set("https://github.com/lars-reimann/Safe-DS")
                licenses {
                    license {
                        name.set("MIT License")
                        url.set("https://github.com/lars-reimann/Safe-DS/blob/main/LICENSE")
                    }
                }
                developers {
                    developer {
                        name.set("Lars Reimann")
                        email.set("mail@larsreimann.com")
                        organization.set("N/A")
                        organizationUrl.set("https://github.com/lars-reimann")
                    }
                }
                scm {
                    connection.set("scm:git:https://github.com/lars-reimann/Safe-DS.git")
                    developerConnection.set("scm:git:https://github.com/lars-reimann/Safe-DS.git")
                    url.set("https://github.com/lars-reimann/Safe-DS")
                }
            }
        }
    }
    repositories {
        maven {
            name = "OSSRH"
            url = uri("https://s01.oss.sonatype.org/service/local/staging/deploy/maven2/")
            credentials {
                username = System.getenv("MAVEN_USERNAME")
                password = System.getenv("MAVEN_PASSWORD")
            }
        }
    }
}

signing {
    val signingKey: String? by project
    val signingPassword: String? by project
    useInMemoryPgpKeys(signingKey, signingPassword)
    sign(publishing.publications["mavenJava"])
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
    testImplementation("io.kotest:kotest-assertions-core-jvm:5.3.1")

    testFixturesImplementation("org.junit.jupiter:junit-jupiter-api:5.8.2")
    testFixturesImplementation("org.eclipse.xtext:org.eclipse.xtext.testing:$xtextVersion")
    testFixturesImplementation("org.eclipse.xtext:org.eclipse.xtext.xbase.testing:$xtextVersion")
    testFixturesImplementation("io.kotest:kotest-assertions-core-jvm:5.3.1")
}

// Source sets ---------------------------------------------------------------------------------------------------------

sourceSets {
    main {
        java.srcDirs("emf-gen", "src-gen")
        resources.srcDirs("src-gen")
        resources.include(
            "**/*.sdsflow",
            "**/*.sdsstub",
            "**/*.tokens",
            "**/*.xtextbin"
        )
    }
}

// Tasks ---------------------------------------------------------------------------------------------------------------

val koverExcludes = listOf(
    "com.larsreimann.safeds.parser.antlr.*",
    "com.larsreimann.safeds.serializer.AbstractSafeDSSemanticSequencer",
    "com.larsreimann.safeds.serializer.AbstractSafeDSSyntacticSequencer",
    "com.larsreimann.safeds.services.*",
    "com.larsreimann.safeds.safeDS.*",
    "com.larsreimann.safeds.testing.*"
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
    mainClass.set("com.larsreimann.safeds.stdlibDocumentation.MainKt")
    args = listOf(outputDirectory)
}
