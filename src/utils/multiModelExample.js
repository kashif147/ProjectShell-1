/**
 * Example usage of multiModelHandler
 */

import {
  handleMultipleModels,
  createModelConfig,
  SELECTION_STRATEGIES,
} from './multiModelHandler';

/**
 * Example: Call multiple AI models and select best response
 */
export const getAIResponseWithMultipleModels = async (userMessage, context) => {
  // Define your model API calls
  const modelConfigs = [
    createModelConfig(
      'gpt-4',
      async () => {
        // Replace with your actual API call
        const response = await fetch('/ai/gpt4', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userMessage, context }),
        });
        return response.json();
      },
      15000
    ),
    createModelConfig(
      'claude',
      async () => {
        const response = await fetch('/ai/claude', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userMessage, context }),
        });
        return response.json();
      },
      15000
    ),
    createModelConfig(
      'local-model',
      async () => {
        const response = await fetch('/ai/local', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userMessage, context }),
        });
        return response.json();
      },
      20000
    ),
  ];

  // Use different strategies based on your needs
  const result = await handleMultipleModels(
    modelConfigs,
    SELECTION_STRATEGIES.FIRST_SUCCESS, // or CONFIDENCE_SCORE, VOTING, etc.
    {
      combineFunction: (responses) => {
        // Custom combine function for COMBINED strategy
        return responses.map((r) => r.content || r).join('\n\n---\n\n');
      },
    }
  );

  return result;
};

/**
 * Example: Use in React component
 */
export const useMultiModelAI = () => {
  const getResponse = async (message, context, strategy = SELECTION_STRATEGIES.FIRST_SUCCESS) => {
    const modelConfigs = [
      createModelConfig('model1', () => callModel1(message, context)),
      createModelConfig('model2', () => callModel2(message, context)),
      createModelConfig('model3', () => callModel3(message, context)),
    ];

    const result = await handleMultipleModels(modelConfigs, strategy);

    if (result.selected) {
      return result.selected.response;
    }

    throw new Error('All models failed');
  };

  return { getResponse };
};

// Placeholder functions
const callModel1 = async (message, context) => {
  // Your API call here
  return { content: 'Response from model 1' };
};

const callModel2 = async (message, context) => {
  // Your API call here
  return { content: 'Response from model 2' };
};

const callModel3 = async (message, context) => {
  // Your API call here
  return { content: 'Response from model 3' };
};



