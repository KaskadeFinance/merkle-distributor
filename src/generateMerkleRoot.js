// Import necessary modules
const fs = require('fs');
const { parseBalanceMap } = require('./parse-balance-map');
const Web3 = require('web3');

const { createClient } = require('@supabase/supabase-js');
const supabaseKey = process.env.SUPABASE_KEY; //needs to be service key
const supabaseUrl = process.env.SUPABASE_URL;
const supabase = createClient(supabaseUrl, supabaseKey);

const web3 = new Web3();

(async () => {
    const campaignId = 1;
    // Query Supabase trades table to get all trades between weeklyStartDate and weeklyEndDate
    const getTradesBetweenDates = async () => {
        const weeklyStartDate = "2024-02-05T00:00:00.000Z"; // Replace with current weeks start date?
        const weeklyEndDate = "2024-02-19T00:00:00.000Z"; // Replace with current weeks end date?
        try {
            const { data, error } = await supabase
                .from('trades')
                .select('*')
                .gte('created_at', weeklyStartDate)
                .lte('created_at', weeklyEndDate);
            if (error) {
                throw new Error(error.message);
            }
            return data;
        } catch (error) {
            console.error('Error:', error);
            return null;
        }
    };

    // Call the function to get trades between dates
    const trades = await getTradesBetweenDates();
    // console.log('Trades:', trades);
    const balances = {}
    for (const trade of trades) {
        // console.log(web3.utils)
        if (trade.points_earned) {
            console.log(trade.points_earned * 1e18);
            console.log(web3.utils.toWei(trade.points_earned.toString()));
            if (trade.wallet_id in balances) {
                balances[trade.wallet_id] += trade.points_earned * 1e18
            } else {
                balances[trade.wallet_id] = trade.points_earned * 1e18
            }
        }
    }
    console.log(balances)

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

            // Function to insert data into weekly_merkles table
            async function insertDataIntoWeeklyMerkles(data, merkleRoot) {
                try {
                    const { data: insertedData, error } = await supabase
                        .from('weekly_merkles')
                        .insert([{ merkle_tree: data, merkle_root: merkleRoot }]);
                    console.log(insertedData)
                    if (error) {
                        throw new Error(error.message);
                    }
                    console.log('Data inserted into weekly_merkles table.');
                } catch (error) {
                    console.error('Error:', error);
                }
            }

            // Call the function to insert data into weekly_merkles table
            insertDataIntoWeeklyMerkles(merkleDistributorInfo, merkleDistributorInfo.merkleRoot);

        } catch (error) {
            console.error('Error:', error);
        }
    }


    // Run the function
    generateMerkleDistributorInfo();
})();