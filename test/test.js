const fs = require('fs');
var format = require('xml-formatter');

const test = () => {
    console.log("Start of the extraction")

    const sourceFileLocation = process.argv[2];
    const destFileLocation = process.argv[3];
    const language = process.argv[4];
    const identifier = process.argv[5];

    const sourceFileContent = JSON.parse(fs.readFileSync(sourceFileLocation));

    const baptisteries = sourceFileContent.baptisteries;

    let finalContent = `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML+RDFa 1.0//EN" "http://www.w3.org/MarkUp/DTD/xhtml-rdfa-1.dtd">
        <html   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" 
                xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#" 
                xmlns:xsd="http://www.w3.org/2001/XMLSchema#" 
                xmlns:dc="http://purl.org/dc/elements/1.1/"
                xmlns:sioc="http://rdfs.org/sioc/ns#"
                xmlns:dcterms="http://purl.org/dc/terms/">
        <head>
        <meta charset="utf-8"/>
        <div xmlns:dc="http://purl.org/dc/elements/1.1/">
    `;

    finalContent += getEmptyElement('meta', 'dc:identifier', identifier);

    finalContent += baptisteries.map(b => {
        let rdfObject = ''
        rdfObject += `<div about="/${b.name}">`;
        rdfObject += getEmptyElement('meta', 'dc:title', b.name);
        rdfObject += getEmptyElement(
            'meta',
            'sioc:content',
            Object.keys(b).map(key => getValue(sourceFileContent, key, b[key], language)).filter(x => x).join('\n')
        );
        rdfObject += getEndElement('div');
        return rdfObject;
    });

    finalContent += `
            </div>
            </div>
        </html>
    `;

    fs.writeFileSync(destFileLocation, format(finalContent));

    console.log('End of the extraction')
}

const getEmptyElement = (tag, attributeKey, attributeValue) => `<${tag} property="${attributeKey}" content="${attributeValue}" />\n`;
const getStartElement = (tag, attributeKey, attributeValue) => `<${tag} property="${attributeKey}" content="${attributeValue}">\n`;
const getEndElement = (tag) => `</${tag}>\n`;

const getValue = (object, key, value, language) => {
    switch (key) {
        case 'buildingCategoryId':
            return `buildingCategory: ${getReference(object, 'buildingCategories', value, language)}`
        case 'civilDioceseId':
            return `civilDiocese: ${getReference(object, 'civilDioceses', value, language)}`
        case 'ecclesiasticalDioceseId':
            return `ecclesiasticalDiocese: ${getReference(object, 'ecclesiasticalDioceses', value, language)}`
        case 'patriarchyId':
            return `patriarchy: ${getReference(object, 'patriarchies', value, language)}`
        case 'provinceId':
            return `province: ${getReference(object, 'provinces', value, language)}`
        case 'regionId':
            return `region: ${getReference(object, 'regions', value, language)}`
        case 'settlementContextId':
            return `settlementContext: ${getReference(object, 'settlementContexts', value, language)}`
        default:
            return value && key !== 'id' && value.length > 0 && `${key}: ${value}`.replace('"', ' ');
    }
}

const getReference = (object, key, value, language) => object[key].filter(i => i.id === value && i.cid === language)[0]?.name || value;

module.exports = { test }