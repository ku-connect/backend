import { embed } from "@nomic-ai/atlas";

export async function generateEmbeddings(text: string) {
  const result = await embed(
    text,
    {
      model: "nomic-embed-text-v1.5",
    },
    process.env.NOMIC_API_KEY!
  );

  return result;
}
