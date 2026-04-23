module.exports = {
  compilerOptions: {
    target: 'ES2020',
    lib: ['DOM', 'DOM.Iterable', 'ESNext'],
    allowJs: false,
    skipLibCheck: true,
    strict: true,
    forceConsistentCasingInFileNames: true,
    noEmit: true,
    esModuleInterop: true,
    module: 'ESNext',
    moduleResolution: 'Node',
    resolveJsonModule: true,
    isolatedModules: true,
    types: ["chrome", "node"],
    jsx: 'preserve',
    incremential: true,
    baseUrl: '.',
    paths: {
      '@/*': ['./src/*']
    }
  },
  include: ['src', 'next-env.d.ts'],
  exclude: ['node_modules']
};