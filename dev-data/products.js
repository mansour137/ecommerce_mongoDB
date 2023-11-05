const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname , 'data', 'productsJson.json');

let existingData = [];

if (fs.existsSync(dataFilePath)) {
    const existingDataString = fs.readFileSync(dataFilePath, 'utf-8');
    existingData = JSON.parse(existingDataString);
}

const productsInJson = [];

for (let i = 1; i <= 10; i++) {
    let data = {
        name: `Laptop HP version mxb${i}`,
        quantity: 10,
        color: ['white', 'gray'],
        brand: 'HP',
        category: '652815ca228820af7460a64a',
        price: i * 300,
        description: 'HP it\'s the best laptops company all over the world',
        imageCover: 'default.jpeg',
    };
    productsInJson.push(data);
}

const updatedData = existingData.concat(productsInJson);

fs.writeFileSync(dataFilePath, JSON.stringify(updatedData, null, 2));

console.log('Success: Data has been written to the file.');
