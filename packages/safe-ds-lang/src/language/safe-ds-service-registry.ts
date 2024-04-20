import { DefaultServiceRegistry, URI } from 'langium';
import { SafeDsLanguageMetaData } from './generated/module.js';
import { SafeDsServices } from './safe-ds-module.js';

export class SafeDsServiceRegistry extends DefaultServiceRegistry {
    getSafeDsServices(): SafeDsServices {
        const extension = SafeDsLanguageMetaData.fileExtensions[0];
        return this.getServices(URI.file(`any.${extension}`)) as SafeDsServices;
    }
}
