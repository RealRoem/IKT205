/** @type {import('jest').Config} */
module.exports = {
    preset: "jest-expo",
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
    testMatch: ["**/tests/**/*.test.ts?(x)"],
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
    },
};
