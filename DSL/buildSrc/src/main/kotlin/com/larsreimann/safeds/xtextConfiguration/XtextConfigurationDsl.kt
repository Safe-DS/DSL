@file:Suppress("unused")

package com.larsreimann.safeds.xtextConfiguration

import io.typefox.xtext2langium.Xtext2LangiumFragment
import org.eclipse.emf.mwe.utils.DirectoryCleaner
import org.eclipse.emf.mwe.utils.ProjectMapping
import org.eclipse.emf.mwe.utils.StandaloneSetup
import org.eclipse.emf.mwe2.ecore.EcoreGenerator
import org.eclipse.emf.mwe2.runtime.workflow.Workflow
import org.eclipse.emf.mwe2.runtime.workflow.WorkflowContextImpl
import org.eclipse.xtext.xtext.generator.CodeConfig
import org.eclipse.xtext.xtext.generator.DefaultGeneratorModule
import org.eclipse.xtext.xtext.generator.StandardLanguage
import org.eclipse.xtext.xtext.generator.XtextGenerator
import org.eclipse.xtext.xtext.generator.model.project.StandardProjectConfig

fun workflow(init: Workflow.() -> Unit): Workflow {
    return Workflow().apply(init)
}

fun Workflow.standaloneSetup(init: StandaloneSetup.() -> Unit) {
    addBean(StandaloneSetup().apply(init))
}

fun StandaloneSetup.projectMapping(projectName: String, path: String) {
    addProjectMapping(
        ProjectMapping().apply {
            this.projectName = projectName
            this.path = path
        },
    )
}

fun Workflow.directoryCleaner(directory: String) {
    addComponent(
        DirectoryCleaner().apply {
            setDirectory(directory)
        },
    )
}

fun Workflow.ecoreGenerator(genModel: String, srcPaths: List<String>, init: EcoreGenerator.() -> Unit = {}) {
    addComponent(
        EcoreGenerator().apply {
            setGenModel(genModel)
            srcPaths.forEach { addSrcPath(it) }
            init()
        },
    )
}

fun Workflow.xtextGenerator(init: XtextGenerator.() -> Unit) {
    addComponent(XtextGenerator().apply(init))
}

fun XtextGenerator.configuration(init: DefaultGeneratorModule.() -> Unit) {
    configuration = DefaultGeneratorModule().apply(init)
}

fun DefaultGeneratorModule.project(init: StandardProjectConfig.() -> Unit) {
    project = StandardProjectConfig().apply(init)
}

fun DefaultGeneratorModule.code(init: CodeConfig.() -> Unit) {
    code = CodeConfig().apply(init)
}

fun XtextGenerator.standardLanguage(init: StandardLanguage.() -> Unit) {
    addLanguage(StandardLanguage().apply(init))
}

fun StandardLanguage.xtext2langium(outputPath: String) {
    this.addFragment(
        Xtext2LangiumFragment().apply {
            setOutputPath(outputPath)
        },
    )
}

fun Workflow.execute() {
    run(WorkflowContextImpl())
}
