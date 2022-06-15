package com.larsreimann.safeds.ide.server.commands

enum class CommandId {
    RemoveOnceOtherCommandsAreAdded;

    override fun toString(): String {
        return "simple-ml." + this.name
    }
}
