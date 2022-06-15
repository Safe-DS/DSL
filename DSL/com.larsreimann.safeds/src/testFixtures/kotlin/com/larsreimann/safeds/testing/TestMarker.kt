package com.larsreimann.safeds.testing

/**
 * Describe a program range in a test file from the opening to the closing test marker.
 */
object TestMarker {

    /**
     * Start of the test marker.
     */
    const val OPEN = '\u00BB' // »

    /**
     * End of the test marker.
     */
    const val CLOSE = '\u00AB' // «
}
