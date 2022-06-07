val javaVersion: Int by rootProject.extra
val xtextVersion: String by rootProject.extra

// Plugins -------------------------------------------------------------------------------------------------------------

plugins {
    java
    kotlin("jvm")
    application
}

java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(javaVersion))
    }
}

application {
    mainClass.set("de.unibonn.simpleml.ide.ServerLauncher2")
}

// Dependencies --------------------------------------------------------------------------------------------------------

dependencies {
    implementation(project(":de.unibonn.simpleml"))
    implementation("org.eclipse.xtext:org.eclipse.xtext.ide:$xtextVersion")

    testRuntimeOnly("org.junit.jupiter:junit-jupiter-engine")
    testImplementation(testFixtures(project(":de.unibonn.simpleml")))
    testImplementation("org.junit.jupiter:junit-jupiter-api")
    testImplementation("org.eclipse.xtext:org.eclipse.xtext.testing:$xtextVersion")
    testImplementation("org.eclipse.xtext:org.eclipse.xtext.xbase.testing:$xtextVersion")
    testImplementation("io.kotest:kotest-assertions-core-jvm:5.3.0")
}

// Source sets ---------------------------------------------------------------------------------------------------------

sourceSets {
    main {
        java.srcDirs("src-gen")
        resources.srcDirs("src-gen")
        resources.include("**/*.ISetup")
    }
}

// Tasks ---------------------------------------------------------------------------------------------------------------

val koverExcludes = listOf(
    "de.unibonn.simpleml.ide.contentassist.antlr.*"
)

tasks {
    processResources {
        val generateXtextLanguage = rootProject.tasks.named("generateXtextLanguage")
        dependsOn(generateXtextLanguage)
    }

    test {
        useJUnitPlatform()

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
                minValue = 33
            }
        }
    }
}
