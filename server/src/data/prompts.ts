import { ChatPromptTemplate } from '@langchain/core/prompts';

export const summarizeChatHistoryTemplate = ChatPromptTemplate.fromTemplate(`
Given the PREV_SUMMARY, summarize the follow up SENTENSES. Save key data, such as the names and preferences of each participant. Be concise. Output the summary as one line of plain text, do not use markdown.
----------
SENTENSES: {messages}
PREV_SUMMARY: {prevSummary}
`);

export const questionGeneratorTemplate = ChatPromptTemplate.fromTemplate(`
Given the CHAT_HISTORY and a follow up QUESTION, rephrase the follow up QUESTION to be a standalone question.
----------
CHAT_HISTORY: {chatHistory}
QUESTION: {question}
`);
