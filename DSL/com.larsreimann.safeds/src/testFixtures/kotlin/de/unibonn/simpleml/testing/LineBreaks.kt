package com.larsreimann.safeds.testing

/**
 * Replaces line-breaks in the string with the ones used by the operating system (\n on Unix, \r on MacOS, \r\n on
 * Windows).
 */
fun String.withSystemLineBreaks(): String {
    return this
        .replace(Regex("\r\n?"), "\n")
        .replace("\n", System.lineSeparator())
}
