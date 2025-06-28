const path = require("path");
// require("cheerio");
// const { CheerioWebBaseLoader } = require("@langchain/community/document_loaders/web/cheerio");
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const { MongoDBAtlasVectorSearch } = require("@langchain/mongodb");
const { MongoClient } = require("mongodb");
const { pull } = require("langchain/hub");

const { TextLoader } = require("langchain/document_loaders/fs/text");
const { PuppeteerWebBaseLoader } = require("@langchain/community/document_loaders/web/puppeteer");
const { OpenAIEmbeddings } = require("@langchain/openai");
const { ChatOpenAI } = require("@langchain/openai");
const { HtmlToTextTransformer } = require("@langchain/community/document_transformers/html_to_text");

const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-large"
});


const mongoClient = new MongoClient(process.env.MONGODB_URI);

const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "whatsapp";
const MONGODB_COLLECTION_NAME = process.env.MONGODB_COLLECTION_NAME || "knowledge_base";


const collection = mongoClient
    .db(MONGODB_DB_NAME)
    .collection(MONGODB_COLLECTION_NAME);

const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
    collection: collection,
    indexName: "default",
    textKey: "text",
    embeddingKey: "embedding",

});


// Load and chunk contents of blog
const pTagSelector = "p";

// const cheerioLoader = new CheerioWebBaseLoader(
//     "https://lilianweng.github.io/posts/2023-06-23-agent/",
//     {
//         selector: pTagSelector
//     }
// );


const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000, chunkOverlap: 200
});

const loadWebsiteData = async (url) => {
    const webLoader = new PuppeteerWebBaseLoader(url, {
        // required params = ...
        // optional params = ...
    });

    const webDocs = await webLoader.load();

    const splitter = RecursiveCharacterTextSplitter.fromLanguage(
        "html",
        {
            chunkSize: 1000, chunkOverlap: 200
        }
    );

    const htmlToTextTransformer = new HtmlToTextTransformer();
    const allSplits = await splitter.pipe(htmlToTextTransformer).invoke(webDocs);

    console.log(allSplits[0].pageContent);

    // const allSplits = await splitter.splitDocuments(webDocs);
    await vectorStore.addDocuments(allSplits);

    return allSplits;
}


const loadTextData = async (path) => {
    const loader = new TextLoader(path);
    const docs = await loader.load();

    const allSplits = await splitter.splitDocuments(docs);
    await vectorStore.addDocuments(allSplits);

    return docs;
}




const worker = async () => {

    // await loadTextData(path.join(__dirname, "data/example.txt"));
    // await loadWebsiteData("https://clik.ai/product/clarity-360");
    // await loadWebsiteData("https://www.fastco.asia/");

    // return;

    // Queryc
    const question = "What is clik ai";
    const results = await vectorStore.similaritySearch(question, undefined, {
        source: "https://www.fastco.asia/"
    });


    // Define prompt for question-answering
    const promptTemplate = await pull("rlm/rag-prompt");

    const messages = await promptTemplate.invoke({
        question: question,
        context: results.map(result => result.pageContent).join("\n\n"),
    });

    const llm = new ChatOpenAI({
        model: "gpt-4o-mini",
        temperature: 0,
    });

    const response = await llm.invoke(messages);

    console.log(response.content);


    // console.log(results[0].pageContent);


    // const vectorStore = await embeddings.embedDocuments(docs.map(doc => doc.pageContent));


};

module.exports = {
    worker
}
