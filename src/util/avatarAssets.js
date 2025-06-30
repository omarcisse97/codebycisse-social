import { XMLParser } from 'fast-xml-parser';
import figureDataxml from '../assets/HabboAssets/figuredata.xml?raw';
import { habboWardrobeIcons } from '../assets/HabboAssets/habboWardrobeIcons';



export const habboAssets =  () => {
    const parser = new XMLParser({
        ignoreAttributes: false,           // Don't ignore attributes
        attributeNamePrefix: "@_",         // Prefix for attributes
        alwaysCreateTextNode: false,       // Don't create text nodes for empty elements
        parseAttributeValue: true,         // Parse attribute values (numbers, booleans)
        trimValues: true                   // Trim whitespace
    });
    const jsonData = parser.parse(figureDataxml);
    return { sets: jsonData, icons: habboWardrobeIcons()}
    
}


