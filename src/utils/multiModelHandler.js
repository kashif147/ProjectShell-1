/**
 * Multi-Model Response Handler
 * Handles multiple AI model responses and selects the best one
 */

/**
 * Selection strategies
 */
export const SELECTION_STRATEGIES = {
  FIRST_SUCCESS: 'first_success', // Use first successful response
  CONFIDENCE_SCORE: 'confidence_score', // Use highest confidence
  VOTING: 'voting', // Majority vote on best response
  COMBINED: 'combined', // Combine all responses
  FASTEST: 'fastest', // Use fastest response
  LONGEST: 'longest', // Use longest response (most detailed)
  SHORTEST: 'shortest', // Use shortest response (most concise)
};

/**
 * Call multiple models and get responses
 * @param {Array} modelConfigs - Array of {name, apiCall, timeout}
 * @returns {Promise<Array>} Array of {model, response, error, latency}
 */
export const callMultipleModels = async (modelConfigs) => {
  const promises = modelConfigs.map(async (config) => {
    const startTime = Date.now();
    try {
      const response = await Promise.race([
        config.apiCall(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), config.timeout || 10000)
        ),
      ]);
      const latency = Date.now() - startTime;
      return {
        model: config.name,
        response,
        error: null,
        latency,
        success: true,
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      return {
        model: config.name,
        response: null,
        error: error.message,
        latency,
        success: false,
      };
    }
  });

  return Promise.all(promises);
};

/**
 * Select best response based on strategy
 * @param {Array} responses - Array of model responses
 * @param {string} strategy - Selection strategy
 * @param {Object} options - Additional options
 * @returns {Object} Selected response with metadata
 */
export const selectBestResponse = (responses, strategy = SELECTION_STRATEGIES.FIRST_SUCCESS, options = {}) => {
  const successful = responses.filter((r) => r.success);
  
  if (successful.length === 0) {
    return {
      selected: null,
      allResponses: responses,
      error: 'No successful responses',
    };
  }

  if (successful.length === 1) {
    return {
      selected: successful[0],
      allResponses: responses,
      strategy,
    };
  }

  let selected;

  switch (strategy) {
    case SELECTION_STRATEGIES.FIRST_SUCCESS:
      selected = successful[0];
      break;

    case SELECTION_STRATEGIES.FASTEST:
      selected = successful.reduce((prev, curr) =>
        curr.latency < prev.latency ? curr : prev
      );
      break;

    case SELECTION_STRATEGIES.LONGEST:
      selected = successful.reduce((prev, curr) => {
        const prevLength = JSON.stringify(prev.response || '').length;
        const currLength = JSON.stringify(curr.response || '').length;
        return currLength > prevLength ? curr : prev;
      });
      break;

    case SELECTION_STRATEGIES.SHORTEST:
      selected = successful.reduce((prev, curr) => {
        const prevLength = JSON.stringify(prev.response || '').length;
        const currLength = JSON.stringify(curr.response || '').length;
        return currLength < prevLength ? curr : prev;
      });
      break;

    case SELECTION_STRATEGIES.CONFIDENCE_SCORE:
      selected = successful.reduce((prev, curr) => {
        const prevScore = prev.response?.confidence || prev.response?.score || 0;
        const currScore = curr.response?.confidence || curr.response?.score || 0;
        return currScore > prevScore ? curr : prev;
      });
      break;

    case SELECTION_STRATEGIES.VOTING:
      // Simple voting: count occurrences of similar responses
      const responseMap = new Map();
      successful.forEach((r) => {
        const key = JSON.stringify(r.response).substring(0, 100);
        if (!responseMap.has(key)) {
          responseMap.set(key, { count: 0, response: r });
        }
        responseMap.get(key).count++;
      });
      const voted = Array.from(responseMap.values()).reduce((prev, curr) =>
        curr.count > prev.count ? curr : prev
      );
      selected = voted.response;
      break;

    case SELECTION_STRATEGIES.COMBINED:
      // Combine all responses
      const combined = {
        model: 'combined',
        response: {
          responses: successful.map((r) => ({
            model: r.model,
            content: r.response,
          })),
          summary: options.combineFunction
            ? options.combineFunction(successful.map((r) => r.response))
            : successful.map((r) => r.response).join('\n\n---\n\n'),
        },
        latency: Math.max(...successful.map((r) => r.latency)),
        success: true,
      };
      return {
        selected: combined,
        allResponses: responses,
        strategy,
      };

    default:
      selected = successful[0];
  }

  return {
    selected,
    allResponses: responses,
    strategy,
    stats: {
      total: responses.length,
      successful: successful.length,
      failed: responses.length - successful.length,
      avgLatency: successful.reduce((sum, r) => sum + r.latency, 0) / successful.length,
    },
  };
};

/**
 * Main function: Call models and select best response
 * @param {Array} modelConfigs - Array of model configurations
 * @param {string} strategy - Selection strategy
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Selected response with metadata
 */
export const handleMultipleModels = async (
  modelConfigs,
  strategy = SELECTION_STRATEGIES.FIRST_SUCCESS,
  options = {}
) => {
  const responses = await callMultipleModels(modelConfigs);
  return selectBestResponse(responses, strategy, options);
};

/**
 * Helper: Create model config for API call
 * @param {string} name - Model name
 * @param {Function} apiCall - Async function that returns response
 * @param {number} timeout - Timeout in ms
 * @returns {Object} Model config
 */
export const createModelConfig = (name, apiCall, timeout = 10000) => ({
  name,
  apiCall,
  timeout,
});



