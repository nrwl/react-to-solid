import { formatFiles, names, Tree, updateJson } from '@nrwl/devkit';
import { Linter } from '@nrwl/linter';
import {
  applicationGenerator as reactAppGenerator,
  setupTailwindGenerator,
} from '@nrwl/react';
import { AppGeneratorSchema } from './schema';

export default async function (tree: Tree, options: AppGeneratorSchema) {
  await reactAppGenerator(tree, {
    name: options.name,
    e2eTestRunner: 'none',
    linter: Linter.EsLint,
    style: 'css',
    bundler: 'vite',
  });
  setupTailwindGenerator(tree, { project: names(options.name).fileName });
  tree.write(
    `apps/${names(options.name).fileName}/vite.config.ts`,
    `import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import viteTsConfigPaths from 'vite-tsconfig-paths';
  
export default defineConfig({
  cacheDir: '../../node_modules/.vite/todo-web-solid',
  plugins: [
    solidPlugin(),
    viteTsConfigPaths({
      root: '../../',
    }),
  ],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
});
`
  );
  tree.write(
    `apps/${names(options.name).fileName}/index.html`,
    `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <link rel="shortcut icon" type="image/ico" href="/src/assets/favicon.ico" />
    <link rel="stylesheet" href="/src/styles.css" />
    <title>Solid App</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>

    <script src="/src/index.tsx" type="module"></script>
  </body>
</html>`
  );
  tree.write(
    `apps/${names(options.name).fileName}/src/index.tsx`,
    `import { Component } from 'solid-js';
import { render } from 'solid-js/web';

const App: Component = () => {
  return (<h1>Hello ${names(options.name).className}</h1>) as any;
};

export default App;

render(App as any, document.getElementById('root') || document.body);`
  );
  updateJson(
    tree,
    `apps/${names(options.name).fileName}/project.json`,
    (json) => ({
      ...json,
      targets: {
        ...json.targets,
        'serve-fullstack': {
          executor: '@nx-trpc-demo/trpc:serve',
          options: {
            frontendProject: names(options.name).fileName,
            backendProject: 'todo-server',
          },
        },
        serve: {
          ...json.targets.serve,
          options: {
            ...json.targets.serve.options,
            proxyConfig: `apps/${names(options.name).fileName}/proxy.conf.json`,
          },
        },
      },
    })
  );
  tree.write(
    `apps/${names(options.name).fileName}/proxy.conf.json`,
    `{
  "/api": {
    "target": "http://localhost:3333",
    "secure": false
  }
}`
  );
  updateJson(
    tree,
    `apps/${names(options.name).fileName}/tsconfig.json`,
    (json) => ({
      ...json,
      compilerOptions: {
        strict: true,
        target: 'ESNext',
        module: 'ESNext',
        moduleResolution: 'node',
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        jsx: 'preserve',
        jsxImportSource: 'solid-js',
        types: ['vite/client'],
        noEmit: true,
        isolatedModules: true,
      },
    })
  );
  tree.delete(`apps/${names(options.name).fileName}/src/main.tsx`);
  tree.delete(`apps/${names(options.name).fileName}/src/app`);
  await formatFiles(tree);
}
