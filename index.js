import xmlToJSON from './src/xmlToJSON.js';

try {
    xmlToJSON();
} catch (err) {
    console.log('Error converting XML to JSON', err);
}