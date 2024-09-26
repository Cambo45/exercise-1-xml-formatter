import fs from 'fs';

export default function xmlToJSON() {
    console.log('Starting Process to convert XML Purchase Order to JSON');
    fs.readFile('./src/XMLInput/Sample1-PO5500000150_20230518184727_0000000000087110.xml', function(err, data) {
        if (err) {
            console.error('Error reading XML file', err);
            return;
        }

        // Convert XML to JSON
        const jsonData = convertXMLToJSON(data.toString());

        fs.writeFile('./src/JSONOutput/Sample1-PO5500000150_20230518184727_0000000000087110.json', JSON.stringify(jsonData.jsonData, null, 2), 'utf-8', function(err) {
            if (err) {
                console.error('Error writing JSON file', err);
                return;
            }
            console.log('Your JSON file is ready, see under src/JSONOutput folder for the output');
        });
    });
};

function convertXMLToJSON(xmlString, i = 0) {
    const leadingZeroKeys = ['VendorNumber__', 'DocNumber__', 'Material__'];
    if (xmlString && typeof xmlString !== 'string') {
        throw new Error('XML must be a string');
    }
    let jsonData = {};

    for (i; i < xmlString.length; i++) {
        //Ignore XML declaration
        if (xmlString[i] === '<' && xmlString[i + 1] === '?') {
            for (i; xmlString[i] !== '>'; i++);
        }
        // Check for closing tag to return to parent object
        else if (xmlString[i] === '<' && xmlString[i + 1] === '/') {
            for (i; xmlString[i] !== '>'; i++);
            return { jsonData, i };
        }
        // Found opening tag
        else if (xmlString[i] === '<') {
            let key = '';
            let value = '';
            i++;
            // Get Key
            while (xmlString[i] !== '>') {
                key += xmlString[i];
                i++;
            }
            // Empty Value
            if (key[key.length - 1] === '/') {
                key = key.slice(0, -1);
                jsonData[key] = '';
                continue;
            }
            i++;
            // Skip white spaces and new lines immediately after key
            if (xmlString[i] === '\n' || xmlString[i] === ' ') {
                for (i; xmlString[i] === '\n' || xmlString[i] === ' '; i++);
            }
            // Check for sub object
            if(xmlString[i] === '<' && xmlString[i + 1] !== '/') {
                //Sub object
                let returnData = convertXMLToJSON(xmlString, i);
                // Check if key already exists and append to array
                if (jsonData[key]) {
                    if (!Array.isArray(jsonData[key])) {
                        jsonData[key] = [jsonData[key]];
                    }
                    jsonData[key].push(returnData.jsonData);
                } else {
                    jsonData[key] = returnData.jsonData;
                }
                i = returnData.i;
                continue;
            }
            // Get Value
            while (xmlString[i] !== '<') {
                value += xmlString[i];
                i++;
            }
            if(leadingZeroKeys.includes(key)) {
                value = removeLeadingZeros(value);
            }
            jsonData[key] = value;
        }
    }
    return { jsonData, i };
}

function removeLeadingZeros(value) {
    if (value && typeof value === 'string') {
        return value.replace(/^0+/, '');
    }
    return value;
}