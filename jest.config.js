module.exports = {
    testEnvironment: "jsdom",
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
    moduleNameMapper: {
      "^@/(.*)$": "<rootDir>/$1",
      "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    },
    collectCoverage: true,
    collectCoverageFrom: ["**/*.{js,jsx}", "!**/node_modules/**", "!**/.next/**"],
    coverageReporters: ["html", "text"],
    transform: {
      "^.+\\.[jt]sx?$": "babel-jest"
    },
    transformIgnorePatterns: [
      "/node_modules/(?!next|@babel|lucide-react)"
    ]
  };
