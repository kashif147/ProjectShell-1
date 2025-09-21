/**
 * Policy Client Utilities
 *
 * Utility functions for easier policy client usage throughout the application
 */

import PolicyClient from "./node-policy-client";
import { usePolicyClient } from "./react-policy-hooks";

/**
 * Create a policy client instance with default configuration
 * @param {string} baseUrl - Base URL for the policy service
 * @param {Object} options - Additional options
 * @returns {PolicyClient} Policy client instance
 */
export const createPolicyClient = (baseUrl, options = {}) => {
  const defaultOptions = {
    timeout: 5000,
    retries: 3,
    cacheTimeout: 300000, // 5 minutes
    ...options,
  };

  return new PolicyClient(baseUrl, defaultOptions);
};

/**
 * Get the default policy client instance
 * @returns {PolicyClient} Default policy client instance
 */
export const getDefaultPolicyClient = () => {
  const baseUrl =
    process.env.REACT_APP_POLICY_SERVICE_URL || "http://localhost:5001";
  return createPolicyClient(baseUrl);
};

/**
 * Policy evaluation helper
 * @param {PolicyClient} policyClient - Policy client instance
 * @param {string} token - JWT token
 * @param {string} resource - Resource name
 * @param {string} action - Action name
 * @param {Object} context - Additional context
 * @returns {Promise<boolean>} Authorization result
 */
export const evaluatePolicy = async (
  policyClient,
  token,
  resource,
  action,
  context = {}
) => {
  try {
    const result = await policyClient.evaluate(
      token,
      resource,
      action,
      context
    );
    return result.success || false;
  } catch (error) {
    console.error("Policy evaluation failed:", error);
    return false;
  }
};

/**
 * Batch policy evaluation helper
 * @param {PolicyClient} policyClient - Policy client instance
 * @param {string} token - JWT token
 * @param {Array} requests - Array of evaluation requests
 * @returns {Promise<Array>} Array of evaluation results
 */
export const evaluateBatchPolicies = async (policyClient, token, requests) => {
  try {
    const results = await policyClient.evaluateBatch(requests);
    return results;
  } catch (error) {
    console.error("Batch policy evaluation failed:", error);
    return requests.map(() => ({ success: false, error: error.message }));
  }
};

/**
 * Quick authorization check helper
 * @param {PolicyClient} policyClient - Policy client instance
 * @param {string} token - JWT token
 * @param {string} resource - Resource name
 * @param {string} action - Action name
 * @param {Object} context - Additional context
 * @returns {Promise<boolean>} Authorization result
 */
export const quickCheck = async (
  policyClient,
  token,
  resource,
  action,
  context = {}
) => {
  try {
    return await policyClient.check(token, resource, action, context);
  } catch (error) {
    console.error("Quick check failed:", error);
    return false;
  }
};

/**
 * Get resource permissions helper
 * @param {PolicyClient} policyClient - Policy client instance
 * @param {string} token - JWT token
 * @param {string} resource - Resource name
 * @returns {Promise<Object>} Resource permissions
 */
export const getResourcePermissions = async (policyClient, token, resource) => {
  try {
    const result = await policyClient.getPermissions(token, resource);
    return result;
  } catch (error) {
    console.error("Get permissions failed:", error);
    return { success: false, error: error.message };
  }
};

/**
 * React hook for policy client with default configuration
 * @param {string} baseUrl - Base URL for the policy service
 * @param {Object} options - Additional options
 * @returns {PolicyClient} Policy client instance
 */
export const useDefaultPolicyClient = (baseUrl, options = {}) => {
  const defaultBaseUrl =
    baseUrl || process.env.REACT_APP_BASE_URL_DEV || "http://localhost:3001";
  const defaultOptions = {
    timeout: 5000,
    retries: 3,
    cacheTimeout: 300000, // 5 minutes
    ...options,
  };

  return usePolicyClient(PolicyClient, defaultBaseUrl, defaultOptions);
};

/**
 * Policy client middleware factory for Express.js
 * @param {PolicyClient} policyClient - Policy client instance
 * @param {string} resource - Resource name
 * @param {string} action - Action name
 * @returns {Function} Express middleware
 */
export const createPolicyMiddleware = (policyClient, resource, action) => {
  return policyClient.middleware(resource, action);
};

/**
 * Cache management utilities
 */
export const PolicyCacheUtils = {
  /**
   * Clear policy client cache
   * @param {PolicyClient} policyClient - Policy client instance
   */
  clearCache: (policyClient) => {
    if (policyClient && typeof policyClient.clearCache === "function") {
      policyClient.clearCache();
    }
  },

  /**
   * Get cache statistics
   * @param {PolicyClient} policyClient - Policy client instance
   * @returns {Object} Cache statistics
   */
  getStats: (policyClient) => {
    if (policyClient && typeof policyClient.getCacheStats === "function") {
      return policyClient.getCacheStats();
    }
    return { size: 0, timeout: 0 };
  },

  /**
   * Check if cache is available
   * @param {PolicyClient} policyClient - Policy client instance
   * @returns {boolean} Cache availability
   */
  isAvailable: (policyClient) => {
    return policyClient && typeof policyClient.getCacheStats === "function";
  },
};

/**
 * Error handling utilities
 */
export const PolicyErrorUtils = {
  /**
   * Check if error is network related
   * @param {Error} error - Error object
   * @returns {boolean} Is network error
   */
  isNetworkError: (error) => {
    return (
      error.message.includes("NETWORK_ERROR") ||
      error.message.includes("timeout") ||
      error.message.includes("fetch")
    );
  },

  /**
   * Check if error is authorization related
   * @param {Error} error - Error object
   * @returns {boolean} Is authorization error
   */
  isAuthError: (error) => {
    return (
      error.message.includes("DENY") ||
      error.message.includes("unauthorized") ||
      error.message.includes("forbidden")
    );
  },

  /**
   * Get user-friendly error message
   * @param {Error} error - Error object
   * @returns {string} User-friendly error message
   */
  getUserFriendlyMessage: (error) => {
    if (PolicyErrorUtils.isNetworkError(error)) {
      return "Network connection failed. Please check your internet connection.";
    }
    if (PolicyErrorUtils.isAuthError(error)) {
      return "Access denied. You do not have permission to perform this action.";
    }
    return "An unexpected error occurred. Please try again.";
  },
};

const PolicyClientUtils = {
  createPolicyClient,
  getDefaultPolicyClient,
  evaluatePolicy,
  evaluateBatchPolicies,
  quickCheck,
  getResourcePermissions,
  useDefaultPolicyClient,
  createPolicyMiddleware,
  PolicyCacheUtils,
  PolicyErrorUtils,
};

export default PolicyClientUtils;
