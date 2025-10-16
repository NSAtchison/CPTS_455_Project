import type { JestConfigWithTsJest } from "ts-jest";

const jestConfig: JestConfigWithTsJest = {
    preset: "ts-jest",
    roots: ["src", "test", "imports"],
    testEnvironment: "node",
    collectCoverageFrom: [
        "src/**/*.ts",
        "!**/node_modules/**",
        "imports/**/*.ts",
        "imports/**/*.tsx",
    ],
    coverageReporters: ["html", "text", "text-summary", "cobertura"],
    testMatch: ["**/*.test.ts"],
    verbose: true,
};

export default jestConfig;