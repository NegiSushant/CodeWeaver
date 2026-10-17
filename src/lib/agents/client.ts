import "dotenv/config";
import { AzureChatOpenAI } from "@langchain/openai";

export const llm = new AzureChatOpenAI({
  model: process.env.OPENAI_MODEL,
  azureOpenAIEndpoint: process.env.OPENAI_ENDPOINT,
  azureOpenAIApiVersion: process.env.OPENAI_API_VERSION,
  azureOpenAIApiKey: process.env.OPENAI_API_KEY,
  azureOpenAIApiDeploymentName: process.env.OPENAI_DEPLOYEMENTNAME,
});
