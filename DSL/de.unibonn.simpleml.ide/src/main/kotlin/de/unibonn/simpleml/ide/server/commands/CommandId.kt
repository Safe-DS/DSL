package de.unibonn.simpleml.ide.server.commands

enum class CommandId {
    RemoveOnceOtherCommandsAreAdded;

    override fun toString(): String {
        return "simple-ml." + this.name
    }
}
