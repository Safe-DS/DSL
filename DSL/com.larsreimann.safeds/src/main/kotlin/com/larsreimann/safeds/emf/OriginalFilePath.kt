package com.larsreimann.safeds.emf

import org.eclipse.emf.common.notify.impl.AdapterImpl

/**
 * Stores the original file path. This is necessary since synthetic resources always have the `sdspipe` extension.
 */
class OriginalFilePath(val path: String) : AdapterImpl()
