require('dotenv').config();
const mongoose = require('./database/db');
const Agent = require('./models/agent');
const Company = require('./models/company');
const User = require('./models/user');

// Sample data for seeding
const sampleAgents = [
    {
        "_id": "68b1e5643066e03fd5c9dddc",
        "name": "Gigger Followup Agent",
        "systemPrompt": "You are an AI agent designed to interact with gig workers regarding their attendance for confirmed shifts. Your primary objective is to determine whether the gig worker will attend their scheduled shift and to update their attendance status in the database using the giggerAttendanceConfirmation tool.      Sometimes you will need to ask the client to connect to customer care of the company. In that case provide +6569839829, customercare@fastgig.sg information.   1. **Input:** You will receive booking details in JSON format, which includes the following key information:   - 'gigger_id': Unique identifier for the gig worker.   - 'gigger_details.name': Gig worker name.   - 'start_time': Scheduled start time for the confirmed shift.   - 'end_time': Schedule end time for the confirmed shift.   - 'job_details.title': Description of the job work.   - 'status': Initial status indicating if the gig worker has confirmed their attendance. booking_id: Booking id   2. **Interaction Process:**   - Greet the gig worker and introduce yourself as their attendance confirmation agent.   - Ask the gig worker if they will be attending the confirmed shift based on the provided booking details.   - Provide details of the shift including 'start_time', 'location', and 'job_description' to remind them of their commitment.   - If the worker confirms attendance, proceed to call the giggerAttendanceConfirmation tool to update the attendance status in the database as \"YES.\"   - If the worker indicates they will not attend, ask for the reason and ensure to document it if necessary. Then, update the attendance status in the database as \"NO\"   - If the worker is uncertain, offer to provide any additional information they may need to make a decision.3. **Output:** The AI should call giggerAttendanceConfirmation tool with json having following keys.    - gigger_id: Gigger id provide     - booking_id: Booking id provide earlier    - gigger_will_check_in: YES/NO    - reason: Some string which tells why gigger chose the action4. **Error Handling:** Ensure to handle any unexpected scenarios such as:   - Invalid or incomplete JSON input.   - Inability to connect with the giggerAttendanceConfirmation tool.   - Unclear responses from the gig worker.5. **Follow-Up:** Encourage the gig worker to reach out if they have further questions or need assistance regarding their gig work.6. **Enb-conversation** You have to end the conversation by saying bye and in the end of conversation you must call the toolYour responses should be clear, concise, and respectful to ensure a positive interaction experience for the gig worker.7.**Human assistance** Sometimes you will need human helps in assistance. In that case call tool name *humanAssistance* with message param .Here is the booking details in JSON format for your context **{context}. Please talk back in users language.\nEnd the conversation with a gratitude but not with the followup question.\n\nFollowing is the example of conversation that ends when you confirm the attendance:\n\nWhen gigger said Yes\n====\nAssistant: Will you be comig?\nUser: Yes\nAssistant: Thank you, See you for the shift\n====\n\nWhen gigger said No\n===\nAssistant: Will you be comig?\nUser: No\nAssistant: Thank you, I will update the attendance\n===\n",
        "description": "",
        "isActive": true,
        "createdBy": "user_31xDBzhgPkzNbfZ4KsNP4yyW9m1",
    }
];

const sampleCompanies = [
    {
        "_id": "68b1e6823066e03fd5c9ddfe",
        "name": "Fastco",
        "location": "Singapore",
        "agents": [
            "68b1e5643066e03fd5c9dddc"
        ],
        "clerkId": "org_31yHMoaxO23ZyM2Hk3dM0T7GqgD",
        "isWhatsappEnabled": false,
        "createdAt": "2025-08-29T17:42:26.760Z",
        "updatedAt": "2025-08-29T18:54:53.799Z",
        "__v": 0
    }
];

const sampleUsers = [
    {
        "_id": "68b1666644449fb6e60464f4",
        "email": "satishkumr001+u10@gmail.com",
        "password": "S@30Kumar",
        "firstName": "User",
        "lastName": "10",
        "companyId": "68b165e544449fb6e60464e0",
        "clerkId": "user_31xCtQkVncTuiskpDsTxUNZCZ3k",
        "isActive": true,
        "createdAt": "2025-08-29T08:35:50.973Z",
        "updatedAt": "2025-08-29T08:35:50.974Z",
        "__v": 0
    },
    {
        "_id": "68b1e8063066e03fd5c9de16",
        "email": "fastco_admin@yopmail.com",
        "password": "@cpx%wbS5S!6E8",
        "firstName": "Fastco",
        "lastName": "Admin",
        "companyId": "68b1e6823066e03fd5c9ddfe",
        "clerkId": "user_31yI9UTaBqFSyW95iadOmLPdjTX",
        "isActive": true,
        "createdAt": "2025-08-29T17:48:54.533Z",
        "updatedAt": "2025-08-29T17:48:54.535Z",
        "__v": 0
    }
];

async function seedDatabase() {
    try {
        console.log('Starting database seeding...');

        // Clear existing data
        await Agent.deleteMany({});
        await Company.deleteMany({});
        await User.deleteMany({});

        console.log('Cleared existing data');

        // Seed agents
        console.log('Seeding agents...');
        const createdAgents = await Agent.insertMany(sampleAgents);
        console.log(`Created ${createdAgents.length} agents`);

        // Seed companies
        console.log('Seeding companies...');
        const createdCompanies = await Company.insertMany(sampleCompanies);
        console.log(`Created ${createdCompanies.length} companies`);

        // Update companies with agent references
        for (let i = 0; i < createdCompanies.length; i++) {
            const company = createdCompanies[i];
            // Assign 1-2 agents to each company
            const agentCount = Math.min(2, createdAgents.length);
            const randomAgents = createdAgents
                .sort(() => 0.5 - Math.random())
                .slice(0, agentCount);

            company.agents = randomAgents.map(agent => agent._id);
            await company.save();
        }
        console.log('Updated companies with agent references');

        // Seed users with company references
        console.log('Seeding users...');
        const usersWithCompanies = sampleUsers.map((user, index) => ({
            ...user,
            companyId: createdCompanies[index % createdCompanies.length]._id
        }));

        const createdUsers = await User.insertMany(usersWithCompanies);
        console.log(`Created ${createdUsers.length} users`);

        console.log('Database seeding completed successfully!');
        console.log('\nSummary:');
        console.log(`- Agents: ${createdAgents.length}`);
        console.log(`- Companies: ${createdCompanies.length}`);
        console.log(`- Users: ${createdUsers.length}`);

        // Display created data
        console.log('\nCreated Agents:');
        createdAgents.forEach(agent => {
            console.log(`  - ${agent.name}: ${agent.description}`);
        });

        console.log('\nCreated Companies:');
        createdCompanies.forEach(company => {
            console.log(`  - ${company.name} (${company.location})`);
        });

        console.log('\nCreated Users:');
        createdUsers.forEach(user => {
            console.log(`  - ${user.firstName} ${user.lastName} (${user.email})`);
        });

    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    } finally {
        // Close database connection
        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
        process.exit(0);
    }
}

// Run the seeder
if (require.main === module) {
    seedDatabase();
}

module.exports = { seedDatabase };
