/**
 * Custom authentication state handler for Baileys
 * More efficient than useMultiFileAuthState for production use
 */

const fs = require('fs');
const { proto } = require('@whiskeysockets/baileys');
const path = require('path');

/**
 * Single file auth state implementation
 * Stores all credentials in one JSON file instead of multiple files
 * @param {string} filename - Path to the auth state file
 */
const useSingleFileAuthState = (filename) => {
  // Ensure the directory exists
  const dir = path.dirname(filename);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Initialize empty state if file doesn't exist
  if (!fs.existsSync(filename)) {
    fs.writeFileSync(filename, JSON.stringify({ creds: {}, keys: {} }));
  }

  // Read the authentication state
  const readState = () => {
    try {
      const rawData = fs.readFileSync(filename, { encoding: 'utf8' });
      return JSON.parse(rawData);
    } catch (error) {
      console.error(`Error reading auth data: ${error}`);
      return { creds: {}, keys: {} };
    }
  };

  // Write authentication state to file
  const writeState = (data) => {
    try {
      // Create a deep copy to avoid modifying the original data
      const dataCopy = JSON.parse(JSON.stringify(data));
      fs.writeFileSync(filename, JSON.stringify(dataCopy, null, 2));
    } catch (error) {
      console.error(`Error saving auth data: ${error}`);
    }
  };

  // Prepare the auth state for Baileys
  let creds = readState().creds || {};
  let keys = {};

  return {
    state: {
      creds,
      keys: {
        get: (type, ids) => {
          const data = {};
          for (const id of ids) {
            let value = keys[`${type}.${id}`];
            if (value) {
              if (type === 'app-state-sync-key' && value.keyData) {
                value = proto.Message.AppStateSyncKeyData.fromObject(value);
              }
              data[id] = value;
            }
          }
          return data;
        },
        set: (data) => {
          for (const category in data) {
            for (const id in data[category]) {
              const value = data[category][id];
              keys[`${category}.${id}`] = value;
            }
          }
          writeState({ creds, keys });
        }
      }
    },
    saveCreds: () => {
      writeState({ creds, keys });
    }
  };
};

/**
 * Verifies if the auth state is valid
 * @param {Object} authState - The auth state to verify
 * @returns {boolean} - True if valid, false otherwise
 */
const isAuthStateValid = (authState) => {
  // Check if creds exists and has the required properties
  if (!authState?.creds) return false;
  
  // Basic validation - these properties should exist in a valid auth state
  const requiredProps = ['me', 'id', 'registered'];
  return requiredProps.every(prop => authState.creds.hasOwnProperty(prop));
};

module.exports = {
  useSingleFileAuthState,
  isAuthStateValid
};
