export const cleanIncompleteAnswer = (answer: string): string => {
  // If the answer is already complete, return it as is
  if (answer.endsWith('\n')) {
    return answer;
  }

  // Split into sentences using regex (handles punctuation followed by a space)
  const sentences = answer.match(/(?:[^.!?]+(?:\.\.\.|[.!?]))+/g) || [];

  // Reconstruct the text excluding the last incomplete sentence
  return sentences.join('').trim();
};
