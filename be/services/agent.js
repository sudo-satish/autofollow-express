const { StateGraph, MessagesAnnotation } = require("@langchain/langgraph");
const _ = require("lodash");
const { ToolNode } = require("@langchain/langgraph/prebuilt");
const { ChatAnthropic } = require("@langchain/anthropic");

const { tools } = require("./tools");


const llm = new ChatAnthropic({
    model: "claude-3-5-sonnet-20240620",
    temperature: 0
});

const llmWithTools = llm.bindTools(tools);

const toolNodeForGraph = new ToolNode(tools);

const shouldContinue = (state) => {
    const { messages } = state;
    const lastMessage = messages[messages.length - 1];
    if ("tool_calls" in lastMessage && Array.isArray(lastMessage.tool_calls) && lastMessage.tool_calls?.length) {
        return "tools";
    }
    return "__end__";
}

const callModel = async (state) => {
    const { messages } = state;
    const response = await llmWithTools.invoke(messages);
    return { messages: response };
}

const graph = new StateGraph(MessagesAnnotation)
    .addNode("agent", callModel)
    .addNode("tools", toolNodeForGraph)
    .addEdge("__start__", "agent")
    .addConditionalEdges("agent", shouldContinue)
    .addEdge("tools", "agent")
    .compile();




const testGenerate = async (messages, test = false) => {
    const inputs = {
        messages: messages,
    };

    if (test) {
        inputs.messages = [...messages, {
            role: 'assistant',
            content: 'Hello, how can I help you today?'
        }, {
            role: 'user',
            content: 'I am fine'
        }, {
            role: 'assistant',
            content: `
            I'm glad to hear you're doing fine. However, I notice that we haven't properly introduced ourselves yet. Allow me to start over.

Hello! I'm an AI assistant from FastGig, and I'm here to confirm your attendance for an upcoming shift. Are you Test Twenty One Mailinator?`
        }, {
            role: 'user',
            content: 'Yes, I am'
        }, {
            role: 'assistant',
            content: `
            Great, thank you for confirming, Test. I'm reaching out regarding your upcoming shift with Auto Mart Supply Pte Ltd. Here are the details of your booking:\n\n- Job: Auto parts\n- Date: June 26, 2025\n- Start time: 11:24 AM\n- End time: 11:29 AM\n- Location: Auto Mart Supply Pte Ltd, 10 Ang Mo Kio Industrial Park 2A, level 5-17, Singapore 568047\n\nCan you please confirm if you will be attending this shift as scheduled?
            `
        }, {
            role: 'user',
            content: 'Yes, I will be attending'
        }];
    }

    const response = await graph.invoke(inputs);

    if (response && response?.messages && Array.isArray(response?.messages)) {
        console.log(response?.messages[response?.messages?.length - 1]?.content);
        return response?.messages[response?.messages?.length - 1]?.content;
    } else {
        console.log(response);
    }

    // const stream = await graph.stream(inputs, {
    //     streamMode: "values",
    // });

    // for await (const { messages } of stream) {
    //     if (Array.isArray(messages)) {
    //         console.log(messages[messages.length - 1]?.content);
    //     }
    // }
}



const generate = async (messages) => {
    const response = await testGenerate(messages);
    return response;
    // console.time('generate');
    // const response = await model.invoke(messages);
    // console.timeEnd('generate');
    // return response.content;
};

module.exports = {
    generate,
    testGenerate
}
