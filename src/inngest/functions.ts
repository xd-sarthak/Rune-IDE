import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

const openrouter = createOpenRouter({
  apiKey: process.env.OPEN_ROUTER_API_KEY
});

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY
})

import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  },
);

export const demoGenerateGoogle = inngest.createFunction(
  { id: "demo-generate" },
  { event: "demo/generate" },
  async ({  step }) => {
    await step.run("generate-text", async () => {
      return await generateText({
        model: google('gemini-2.5-flash'),
        prompt: 'Write a vegetarian lasagna recipe for 4 people.',
      }); 
    });
  },
);

export const demoGenerateOpenRouter = inngest.createFunction(
  { id: "demo-generate-two" },
  { event: "demo/generate-two" },
  async ({  step }) => {
    await step.run("generate-text", async () => {
      return await generateText({
        model: openrouter.chat('xiaomi/mimo-v2-flash'),
        prompt: 'What is OpenRouter?',
      });
    });  },
);