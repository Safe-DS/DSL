package de.unibonn.simpleml.testing.assertions

import io.kotest.matchers.doubles.plusOrMinus
import io.kotest.matchers.shouldBe

infix fun Double.shouldBeCloseTo(n: Double) {
    this.shouldBe(n plusOrMinus Math.ulp(n))
}
