import { esBuildTypes, pathUtils, Loader } from './deps.ts'
import { transformSvelte } from './transform_svelte.ts'

const RESOLVE_BARE = [`file://${Deno.cwd()}/app/model/mod`]

export function makeResolver(loader: Loader, localFiles: string[]): esBuildTypes.Plugin {
	const resolvePotentialBareSpecifier = (specifier: string) => {
		if (RESOLVE_BARE.includes(specifier)) return `${specifier}.ts`

		return specifier
	}

	return {
		name: 'resolve',
		setup(build) {
			build.onResolve({ filter: /./ }, args => {
				const resolveDir = args.importer ? urlDirname(args.importer) : `file://${args.resolveDir}`

				if (args.path.startsWith('file://') || args.path.startsWith('http://') || args.path.startsWith('https://'))
					return { path: args.path, namespace: 'resolve' }

				const importingUrl = new URL(resolveDir)

				if (args.path.startsWith('/'))
					return buildResolveResult({
						protocol: importingUrl.protocol,
						host: importingUrl.host,
						pathname: args.path,
					})

				const resolvedPath = pathUtils.join(importingUrl.pathname, args.path)

				// Add a '.ts' extension to all imports inside svelte files that don't already have an extension
				const withExtension =
					args.importer.endsWith('.svelte') && !pathUtils.basename(resolvedPath).includes('.')
						? `${resolvedPath}.ts`
						: resolvedPath

				return buildResolveResult({
					protocol: importingUrl.protocol,
					host: importingUrl.host,
					pathname: withExtension,
				})
			})

			build.onLoad({ filter: /./ }, async args => {
				const specifier = args.path
				const url = resolvePotentialBareSpecifier(specifier)

				if (specifier.startsWith('file://')) localFiles.push(url.slice(7))

				const load = await loader.load(url)
				if (!load) return undefined

				if (load.kind === 'module' && load.specifier.endsWith('.svelte')) {
					const svelte = await transformSvelte(load.content, new URL(url))

					if (!svelte.contents) {
						console.warn(`No contents ${url} after svelte transformation`)
						return undefined
					}

					load.content = svelte.contents
				}

				if (load.kind !== 'module') throw new Error('Expected to load a module')

				return { contents: load.content, loader: url.endsWith('.svelte') ? 'js' : 'ts' }
			})
		},
	}
}

export interface BuildUrlParams {
	protocol: string | null
	host: string | null
	pathname: string
}

function buildResolveResult(params: BuildUrlParams) {
	if (params.protocol === 'file:')
		return {
			path: `file://${params.pathname}`,
			namespace: 'resolve',
			watchFiles: [params.pathname],
		}

	return {
		path: `${params.protocol}//${params.host}${params.pathname}`,
		namespace: 'resolve',
	}
}

function urlDirname(url: string) {
	const sections = url.split('/')
	sections.pop()

	return sections.join('/')
}
