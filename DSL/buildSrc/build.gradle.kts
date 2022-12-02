val javaVersion by extra(11)
val xtextVersion by extra("2.26.0.M2")

// Plugins -------------------------------------------------------------------------------------------------------------

plugins {
    kotlin("jvm") version "1.7.22"
    idea
}

repositories {
    mavenCentral()
}

java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(javaVersion))
    }
}

// Dependencies --------------------------------------------------------------------------------------------------------

dependencies {
    api(platform("org.eclipse.xtext:xtext-dev-bom:$xtextVersion"))
    implementation("org.eclipse.xtext:org.eclipse.xtext:$xtextVersion")

    implementation("org.eclipse.emf:org.eclipse.emf.mwe2.launch:2.14.0.M1")
    implementation("org.eclipse.xtext:org.eclipse.xtext.common.types:$xtextVersion")
    implementation("org.eclipse.xtext:org.eclipse.xtext.xtext.generator:$xtextVersion")
    implementation("org.eclipse.xtext:xtext-antlr-generator:2.1.1")
}

// Tasks ---------------------------------------------------------------------------------------------------------------

tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile>().configureEach {
    kotlinOptions.freeCompilerArgs += "-Xopt-in=kotlin.RequiresOptIn"
}
