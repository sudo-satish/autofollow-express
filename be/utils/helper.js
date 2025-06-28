const generateSystemPrompt = (agent, context) => {
    return `${agent.systemPrompt.replace('{context}', context)}

            ===
            Metadata: 
            ===
            Followup ID: ${followup._id}
            Client ID: ${clientId}
            Company ID: ${companyId}
            Agent ID: ${agentId}
            Followup Date: ${followupDateTime}
            Followup Status: ${status}
            ===
            `;
};

module.exports = {
    generateSystemPrompt
};