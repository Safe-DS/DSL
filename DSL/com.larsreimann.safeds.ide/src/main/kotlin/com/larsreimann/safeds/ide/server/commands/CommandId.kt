package com.larsreimann.safeds.ide.server.commands

enum class CommandId {
    RemoveOnceOtherCommandsAreAdded;

    override fun toString(): String {
        return "safe-ds." + this.name
    }
}
