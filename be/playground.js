require('dotenv').config();
const mongoose = require('./database/db');
const { testGenerate } = require('./services/agent');
const { generateNextFollowupMessage } = require('./services/followup');
const { worker } = require('./services/rag');

const main = async () => {
    // const followupId = '685d645c5c089f13e082351f';
    // await generateNextFollowupMessage(followupId);

    await worker();

    // await testGenerate();
}

main();