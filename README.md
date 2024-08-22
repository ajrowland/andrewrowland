# Personal site

Uses [Astro](https://astro.build/). Specifically [Astro content collections](https://docs.astro.build/en/guides/content-collections/) to manage the content.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `bun install`             | Installs dependencies                            |
| `bun run dev`             | Starts local dev server at `localhost:4321`      |
| `bun run build`           | Build your production site to `./dist/`          |
| `bun run preview`         | Preview your build locally, before deploying     |
| `bun run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `bun run astro -- --help` | Get help using the Astro CLI                     |

I'm using Bun, but feel free to use your package manager of choice.

## 🚀 Deployment

Uses Github pages to host, via a workflow. Merging to the `main` branch, will build and deploy the site.
