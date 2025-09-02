// This algorithm I created, shuffles the array, with aggressiveness based on the learner's level.

import { GrammarCheckResponse } from "../api/grammar/grammar-check.entity";

// Level can be "basic", "intermediate", or "advanced" (default: "basic").
export function shuffleArray(arr: string[], level: "basic" | "intermediate" | "advanced" = "basic") {
  if (arr.length <= 1) {
    return [...arr];
  }

  // set shuffle aggressiveness based on level
  let maxAttempts: number;
  let minChanges: number;

  switch (level) {
    case "advanced":
      maxAttempts = 30;
      minChanges = Math.max(2, Math.floor(arr.length * 0.7)); // 70% of words must move
      break;
    case "intermediate":
      maxAttempts = 20;
      minChanges = Math.max(1, Math.floor(arr.length * 0.5)); // 50% of words must move
      break;
    case "basic":
    default:
      maxAttempts = 10;
      minChanges = 1; // At least 1 word must move
      break;
  }

  let result = [...arr];
  let attempts = 0;

  function countChanges(a: string[], b: string[]) {
    let changes = 0;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) changes++;
    }
    return changes;
  }

  do {
    // fisher-yates shuffle
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    attempts += 1;
    if (attempts >= maxAttempts) {
      break;
    }
  } while (
    result.every((value, index) => value === arr[index]) || // avoid identical order
    countChanges(result, arr) < minChanges // ensure enough words are moved, based on the level
  );

  return result;
}

export const mapGrammarCheckResponse = (response: GrammarCheckResponse, input: string) => {
  const { matches } = response;
  if(matches.length === 0) return {
    mostSimilar: undefined,
    incorrectWord: undefined
  }
  const { replacements, context } = matches[0];
  const { offset, length } = context;
  const incorrectWord = input.slice(offset, offset + length);
  const mostSimilar = replacements[0]?.value;
  return {
    mostSimilar,
    incorrectWord,
  };
};