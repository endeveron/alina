import { Document } from '@langchain/core/documents';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { BufferMemory } from 'langchain/memory';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';

import { Character, CharacterKey } from '../types/chat';

/* Maps */
export const messageMemoryMap = new Map<string, BufferMemory>();
export const vectorStoreMap = new Map<string, MemoryVectorStore>();
export const documentMap = new Map<CharacterKey, Document[]>();
export const chatSummaryMap = new Map<string, string>();

/* Buffer memory */

export const getMessageMemory = async ({ userId }: { userId: string }) => {
  const memoryFromMap = messageMemoryMap.get(userId);
  if (memoryFromMap) return memoryFromMap;

  // Initialize the buffer memory to store chat history
  const messageMemory = new BufferMemory({
    memoryKey: 'chatHistory',
    inputKey: 'question', // The key for the input to the chain
    outputKey: 'answer', // The key for the final conversational output of the chain
    returnMessages: true, // Return as a list of messages. By default, they are returned as a single string.
    // chatHistory, // Store chat history in db
  });

  // Save chat messages memory to messageMemoryMap
  messageMemoryMap.set(userId, messageMemory);
  return messageMemory;
};

/** Vector store */

export const getCharacterDocuments = async ({
  characterKey,
  characterContext,
}: {
  characterKey: CharacterKey;
  characterContext: string[];
  // chunkSize?: number;
  // chunkOverlap?: number;
}): Promise<Document[]> => {
  // Try to get cached docs from a local map object
  const documentsFromMap = documentMap.get(characterKey);
  if (!characterContext.length) return [];
  if (documentsFromMap) return documentsFromMap;

  // // Split text to cunks
  // const textSplitter = new RecursiveCharacterTextSplitter({
  //   chunkSize,
  //   chunkOverlap,
  //   separators: ['---'],
  //   keepSeparator: true,
  // });

  // // Create the documents from the splited text
  // const documents = await textSplitter.createDocuments([characterContext]);

  const documents: Document[] = characterContext.map(
    (text: string) => new Document({ pageContent: text })
  );

  // Save docs to documentMap
  documentMap.set(characterKey, documents);

  return documents;
};

export const getVectorStoreForCharacter = async (
  character: Character
): Promise<MemoryVectorStore | undefined> => {
  const characterKey = character.key;

  // Try to get the vector store from the vectorStoreMap
  const vectorStore = vectorStoreMap.get(characterKey);
  if (vectorStore) return vectorStore;

  // Create a vector store for the provided characterKey
  try {
    // Create an instance for generating embeddings
    const embeddings = new GoogleGenerativeAIEmbeddings();

    // Generate langchain documents for vector store from a context array
    const documents = await getCharacterDocuments({
      characterKey,
      characterContext: character.context,
      // chunkSize: characterData.vectorStore.chunkSize,
      // chunkOverlap: characterData.vectorStore.chunkOverlap,
    });

    // Create a vector store from the documents
    const newVectorStore = await MemoryVectorStore.fromDocuments(
      documents,
      embeddings
    );

    // Save to a local map
    vectorStoreMap.set(characterKey, newVectorStore);

    return newVectorStore;
  } catch (error: unknown) {
    console.error(`getVectorStoreForCharacter`, error);
  }
};

export const getVectorStoreData = async (
  characterKey: CharacterKey
): Promise<MemoryVectorStore | undefined> => {
  const vectorStore = vectorStoreMap.get(characterKey);
  return vectorStore;
};
