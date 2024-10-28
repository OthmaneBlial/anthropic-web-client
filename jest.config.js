/* eslint-disable no-undef */

module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleFileExtensions: ["ts", "js"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  testMatch: ["**/*.test.ts"],
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
};
