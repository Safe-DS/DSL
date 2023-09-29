import fs from 'fs';
import { CompositeGeneratorNode, toString } from 'langium';
import path from 'path';
import { SdsModule } from '../language/generated/ast.js';
import { extractAstNode, extractDestinationAndName } from './cli-util.js';
import chalk from 'chalk';
import { createSafeDsServices } from '../language/safe-ds-module.js';
import { NodeFileSystem } from 'langium/node';

export const generateAction = async (fileName: string, opts: GenerateOptions): Promise<void> => {
    const services = createSafeDsServices(NodeFileSystem).SafeDs;
    const module = await extractAstNode<SdsModule>(fileName, services);
    const generatedFilePath = generatePython(module, fileName, opts.destination);
    // eslint-disable-next-line no-console
    console.log(chalk.green(`Python code generated successfully: ${generatedFilePath}`));
};

export type GenerateOptions = {
    destination?: string;
};

export const generatePython = function (
    module: SdsModule,
    filePath: string,
    destination: string | undefined,
): string[] {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${path.join(data.destination, data.name)}.py`;

    const fileNode = new CompositeGeneratorNode();
    // fileNode.append('"use strict";', NL, NL);
    // model.greetings.forEach(greeting => fileNode.append(`console.log('Hello, ${greeting.person.ref?.name}!');`, NL));

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, toString(fileNode));
    return [generatedFilePath];
};
