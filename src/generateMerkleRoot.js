// Import necessary modules
const fs = require('fs');
const { parseBalanceMap } = require('./parse-balance-map');

// Example balances
const balances = {
    '0xFeCD3485B88Aa711156db8bb476f2530ceb9400D': 100000000000000000000,
    '0x987AB8C9161d4063152DdBf93A2249BE66E12C36': 200000000000000000000
}

// Function to generate Merkle Distributor Info and write it to a file
async function generateMerkleDistributorInfo() {
    try {
        // Parse the balance map to get Merkle distributor info
        const merkleDistributorInfo = parseBalanceMap(balances);

        // Convert the information to a JSON string
        const data = JSON.stringify(merkleDistributorInfo, null, 2);

        // Write the JSON to a file
        fs.writeFileSync('merkleDistributor.json', data);

        console.log('Merkle distributor JSON file created.');
    } catch (error) {
        console.error('Error:', error);
    }
}

// Run the function
generateMerkleDistributorInfo();
