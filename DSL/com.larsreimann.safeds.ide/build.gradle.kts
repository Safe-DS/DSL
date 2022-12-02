val javaVersion: Int by rootProject.extra
val xtextVersion: String by rootProject.extra

// Plugins -------------------------------------------------------------------------------------------------------------

plugins {
    java
    kotlin("jvm")
    application
    id("org.jetbrains.kotlinx.kover")
}

java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(javaVersion))
    }
}

application {
    mainClass.set("com.larsreimann.safeds.ide.ServerLauncher2")
}

kover {
    filters {
        classes {
            excludes += "com.larsreimann.safeds.ide.contentassist.antlr.*"
        }
    }

    verify {
        rule {
            name = "Minimal line coverage rate in percents"
            bound {
                minValue = 33
            }
        }
    }
}

// Dependencies --------------------------------------------------------------------------------------------------------

dependencies {
    implementation(project(":com.larsreimann.safeds"))
    implementation("org.eclipse.xtext:org.eclipse.xtext.ide:$xtextVersion")

    testRuntimeOnly("org.junit.jupiter:junit-jupiter-engine")
    testImplementation(testFixtures(project(":com.larsreimann.safeds")))
    testImplementation("org.junit.jupiter:junit-jupiter-api")
    testImplementation("org.eclipse.xtext:org.eclipse.xtext.testing:$xtextVersion")
    testImplementation("org.eclipse.xtext:org.eclipse.xtext.xbase.testing:$xtextVersion")
    testImplementation("io.kotest:kotest-assertions-core-jvm:5.5.4")
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

tasks {
    processResources {
        val generateXtextLanguage = rootProject.tasks.named("generateXtextLanguage")
        dependsOn(generateXtextLanguage)
    }

    test {
        useJUnitPlatform()
    }
}
