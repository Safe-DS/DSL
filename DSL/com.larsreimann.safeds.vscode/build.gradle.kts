import com.github.gradle.node.npm.task.NpxTask

// Plugins -------------------------------------------------------------------------------------------------------------

plugins {
    base
    id("com.github.node-gradle.node")
    idea
}

node {
    version.set("17.9.0")
    download.set(true)
}

idea {
    module {
        sourceDirs.add(file("src"))
        sourceDirs.add(file("syntaxes"))

        excludeDirs.add(file("dist"))
        excludeDirs.add(file("ls"))
        excludeDirs.add(file("node_modules"))
    }
}

// Tasks ---------------------------------------------------------------------------------------------------------------

val extensionPath = "dist/simple-ml-${project.version}.vsix"

tasks.register<Sync>("copyApplication") {
    val installDistTask = project(":com.larsreimann.safeds.ide").tasks.named("installDist")
    dependsOn(installDistTask)

    from(installDistTask.get().outputs)
    into("ls")
}

tasks {
    npmInstall {
        dependsOn("copyApplication")
    }
}

tasks.register<NpxTask>("vsCodeExtension") {
    group = "Build"
    description = "Generate an extension for VS Code"

    dependsOn("npmInstall")

    inputs.dir("icons")
    inputs.dir("ls")
    inputs.dir("src")
    inputs.dir("syntaxes")
    inputs.files(
        ".vscodeignore",
        "CHANGELOG.md",
        "language-configuration.json",
        "package.json",
        "README.md",
        "tsconfig.json"
    )
    outputs.dirs("dist")

    command.set("vsce")
    args.set(listOf("package", "--out", extensionPath))
}

tasks.register<Exec>("installExtension") {
    dependsOn("vsCodeExtension")

    inputs.files(extensionPath)
    outputs.dirs()

    if (System.getProperty("os.name").toLowerCase().contains("windows")) {
        commandLine("powershell", "code", "--install-extension", extensionPath)
    } else {
        commandLine("code", "--install-extension", extensionPath)
    }
}

tasks.register<Exec>("launchVSCode") {
    group = "Run"
    description = "Launch VS Code with the extension installed"

    dependsOn("installExtension")

    if (System.getProperty("os.name").toLowerCase().contains("windows")) {
        commandLine("powershell", "code", "-n", "../com.larsreimann.safeds/src/main/resources/stdlib")
    } else {
        commandLine("code", "-n", "../com.larsreimann.safeds/src/main/resources/stdlib")
    }
}

tasks {
    build {
        dependsOn("vsCodeExtension")
    }

    clean {
        delete(named("copyApplication").get().outputs)
        delete(named("vsCodeExtension").get().outputs)
    }
}
