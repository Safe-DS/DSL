import { DefaultConfigurationProvider, Emitter, Event } from 'langium';
import { DidChangeConfigurationParams } from 'vscode-languageserver';

export class SafeDsConfigurationProvider extends DefaultConfigurationProvider {
    protected onConfigurationSectionUpdateEmitter = new Emitter<ConfigurationSectionUpdate>();

    override updateConfiguration(change: DidChangeConfigurationParams): void {
        if (!change.settings) {
            /* c8 ignore next 2 */
            return;
        }

        Object.keys(change.settings).forEach((section) => {
            const configuration = change.settings[section];
            this.updateSectionConfiguration(section, configuration);
            this.onConfigurationSectionUpdateEmitter.fire({ section, configuration });
        });
    }

    /**
     * Get notified after a configuration section has been updated.
     */
    get onConfigurationSectionUpdate(): Event<ConfigurationSectionUpdate> {
        return this.onConfigurationSectionUpdateEmitter.event;
    }
}

type ConfigurationSectionUpdate = {
    /**
     * The name of the configuration section that has been updated.
     */
    section: string;

    /**
     * The updated configuration section.
     */
    configuration: any;
};
