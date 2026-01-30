import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { firecrawl } from '@/lib/firecrawl';

const URL_REGEX = /https?:\/\/[^\s]+/g;

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
  async ({event, step }) => {

    const {prompt} = event.data as {prompt: string};
    const urls = await step.run("extract-urls", async () => {
      return prompt.match(URL_REGEX) ?? [];
    }) as string[];

    const scrapedContent = await step.run("scrape-urls", async () => {
      //all urls are scraped in parallel
      const results = await Promise.all(
        urls.map(async (url) => {
          const result = await firecrawl.scrape(
            url,
            { formats: ["markdown"] },
          );
          return result.markdown ?? null;
        })
      );
      return results.filter(Boolean).join("\n\n");
    });

    const finalPrompt = scrapedContent
    ? `Context:\n${scrapedContent}\n\nQuestion: ${prompt}`
    : prompt;

    await step.run("generate-text", async () => {
      return await generateText({
        model: google('gemini-2.5-flash'),
        prompt: finalPrompt,
        experimental_telemetry: {
          isEnabled: true,
          recordInputs: true,
          recordOutputs: true,
        }
      }); 
    });
  },
);

/*
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
*/