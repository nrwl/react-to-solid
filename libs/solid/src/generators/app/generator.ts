import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  names,
  offsetFromRoot,
  Tree,
  updateJson,
} from '@nrwl/devkit';
import * as path from 'path';
import { AppGeneratorSchema } from './schema';
import {
  applicationGenerator as reactAppGenerator,
  setupTailwindGenerator,
} from '@nrwl/react';
import { Linter } from '@nrwl/linter';

interface NormalizedSchema extends AppGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  parsedTags: string[];
}

function normalizeOptions(
  tree: Tree,
  options: AppGeneratorSchema
): NormalizedSchema {
  const name = names(options.name).fileName;
  const projectDirectory = options.directory
    ? `${names(options.directory).fileName}/${name}`
    : name;
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-');
  const projectRoot = `${getWorkspaceLayout(tree).libsDir}/${projectDirectory}`;
  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];

  return {
    ...options,
    projectName,
    projectRoot,
    projectDirectory,
    parsedTags,
  };
}

function addFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    ...names(options.name),
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    template: '',
  };
  generateFiles(
    tree,
    path.join(__dirname, 'files'),
    options.projectRoot,
    templateOptions
  );
}

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
    <link rel="stylesheet" type="image/ico" href="/src/assets/favicon.ico" />
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
    `import { Component, createSignal } from 'solid-js';
// import { QueryClient, QueryClientProvider } from '@tanstack/solid-query';

import logo from './logo.svg';
import styles from './App.module.css';
// import { TodoList, trpc } from '@nx-trpc-demo/components';
// import { httpBatchLink } from 'solid-trpc';

const App: Component = () => {

  // const [queryClient] = createSignal(() => new QueryClient());
  // const [trpcClient] = createSignal(() =>
  //   trpc.createClient({
  //     links: [httpBatchLink({ url: '/api' })],
  //   })
  // );

  // return (
  //   <trpc.Provider client={trpcClient} queryClient={queryClient}>
  //     <QueryClientProvider client={queryClient}>
  //       <div class={styles.App}>
  //         <header class={styles.header}>
  //         <TodoList />
  //           <img src={logo} class={styles.logo} alt="logo" />
  //           <p>
  //             Edit <code>src/App.tsx</code> and save to reload.
  //           </p>
  //           <a
  //             class={styles.link}
  //             href="https://github.com/solidjs/solid"
  //             target="_blank"
  //             rel="noopener noreferrer"
  //           >
  //             Learn Solid
  //           </a>
  //         </header>
  //       </div>
  //     </QueryClientProvider>
  //   </trpc.Provider>
  // );

  return  (
    <div class={styles.App}>
        <header class={styles.header}>
          <img src={logo} class={styles.logo} alt="logo" />
          <p>
            Edit <code>src/App.tsx</code> and save to reload.
          </p>
          <a
            class={styles.link}
            href="https://github.com/solidjs/solid"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn Solid
          </a>
        </header>
      </div>
  )
};

export default App;`
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
      },
    })
  );
  await formatFiles(tree);
}
