import { createAgent } from "langchain";
import { llm } from "./client";
import { graphTools } from "./tools";
import { systemPrompt } from "./prompt";

const agent = createAgent({
  model: llm,
  tools: graphTools,
  systemPrompt: systemPrompt,
});

export default agent;
