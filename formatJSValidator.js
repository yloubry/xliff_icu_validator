const fs = require('fs');
const path = require('path');
const MessageFormat = require('@messageformat/core');
const { XMLParser } = require('fast-xml-parser');

const options = {
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    attributesGroupName: "PROPS_",
    processEntities: true
};

let error = false

function extractIdAndTarget(transUnit, targetLanguage) {
    const id = transUnit.PROPS_["@_id"]
    const source = transUnit.source
    const target = transUnit.target

    if (target.trim() === "" && source.trim() != "") {
        console.error(`Error validating stringID ${id} for the language ${targetLanguage}`);
        console.warn(`ID: ${id}`)
        console.warn(`Source: ${source}`)
        console.warn(`Target: ${target}`)
        console.error(`Source is not empty but target is empty`)
        console.log('')
        error = true
        return null
    } else if (target.trim() !== "" && source.trim() === "") {
        console.error(`Error validating stringID ${id} for the language ${targetLanguage}`);
        console.warn(`ID: ${id}`)
        console.warn(`Source: ${source}`)
        console.warn(`Target: ${target}`)
        console.warn(`Source is empty but target is not empty. This might be valid and can be ignored`)
        console.log('')
        return null
    } else if (source.trim() === "") return null;
    return { source, target, id };
}

function validateTarget(source, target, targetLanguage, id) {
    try {
        const icupluralselect = /(?:(plural|select),)/;
        const hasPluralSelectSource = icupluralselect.test(source);
        const hasPluralSelectTarget = icupluralselect.test(target);
        const param = /\$?{?{[a-zA-Z_-]+}}?/g;
        const source_params = [...source.matchAll(param)];
        const source_param_array = source_params.map(match => match[0]);
        const target_params = [...target.matchAll(param)];
        const target_param_array = target_params.map(match => match[0]);

        if (source_params.length) {
            let missingParam = [];
            let extraParam = [];
            if (target_param_array.length > source_param_array.length) {
                for (const param of target_param_array) {
                    if (!source_param_array.includes(param)) {
                        extraParam.push(param)
                    }
                }
                if (extraParam.length) throw new Error(`Variable [${extraParam.join(", ")}] not found in source`)
            }
            else {
                for (const param of source_param_array) {
                    if (!target_param_array.includes(param)) {
                        missingParam.push(param)
                    }
                }
                if (missingParam.length) throw new Error(`Variable [${missingParam.join(", ")}] missing in target`)
            }
        } else if (target_params.length > source_params.length) throw new Error(`Variable [${target_params.join(", ")}] not found in source`)

        if (hasPluralSelectSource) {
            if (!hasPluralSelectTarget) throw new Error(`Plural or Select argument found in source but is missing in target`)
        }

        const mf = new MessageFormat(targetLanguage);
        mf.compile(target);
    } catch (error2) {
        error = true
        console.error(`Error validating stringID ${id} for the language ${targetLanguage}`);
        console.warn(`ID: ${id}`)
        console.warn(`source: ${source}`)
        console.warn(`target: ${target}`)
        console.error(error2.message)
        console.log('')
    }
}

function processDirectory(directoryPath) {
    const files = fs.readdirSync(directoryPath);
    for (const filename of files) {

        if (filename.endsWith('.xliff') || filename.endsWith('.xlf')) {
            console.log(`Processing ${path.join(directoryPath, filename)}`)
            const fileContent = fs.readFileSync(path.join(directoryPath, filename), 'utf-8');
            const parser = new XMLParser(options);
            let jsonObj = parser.parse(fileContent);
            const transUnits = jsonObj.xliff.file.body['trans-unit'];
            const targetLanguage = jsonObj.xliff.file.PROPS_["@_target-language"]
            for (const transUnit of transUnits) {
                const result = extractIdAndTarget(transUnit, targetLanguage);
                if (result) {
                    const { source, target, id } = result;
                    try {
                        validateTarget(source, target, targetLanguage, id);
                    } catch {
                        // Do Nothing
                    }
                }
            }
        }
    }
    if (error) {
        console.log('Some error occured, see logs')
        process.exit(1);
    }
    else console.log('ICU strings looks good :)')
}

const directoryPath = process.argv[2];
if (!directoryPath) {
    console.log('Usage: node script.js <directory_path>');
} else {
    processDirectory(directoryPath);
}
