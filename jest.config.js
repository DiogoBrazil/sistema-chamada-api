module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
    '!src/types.ts',
    '!src/container.ts',
    '!src/types/**'
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  // Mockar automaticamente as dependências do módulo
  automock: false,
  // Limpar mocks entre cada teste
  clearMocks: true,
  // Indicar que estamos usando a versão 29 do Jest
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
};