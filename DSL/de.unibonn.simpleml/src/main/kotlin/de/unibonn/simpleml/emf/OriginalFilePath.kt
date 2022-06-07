package de.unibonn.simpleml.emf

import org.eclipse.emf.common.notify.impl.AdapterImpl

/**
 * Stores the original file path. This is necessary since synthetic resources always have the `smlflow` extension.
 */
class OriginalFilePath(val path: String) : AdapterImpl()
