import { createCache, esBuild } from './deps.ts'
import { makeResolver } from './resolve.ts'
import { createWatcher } from './watcher.ts'

await esBuild.initialize({})

const generateEnvSnippet = (env: Record<string, string>) => `

;(function() {
	const env = ${JSON.stringify(env)}

	if (!window.Deno) window.Deno = {}
	
	window.Deno.env = {
		toObject() {
			return {...env}
		},
		get(key) {
			return env[key]
		},
		set(key, value) {
			env[key] = value
		},
		delete(key) {
			delete env[key]
		}
	}
})();

`

export interface BundleParams {
	entryPath: string
	env: Record<string, string>
	shouldRefetchRemote?: boolean
}

export interface BundleResult {
	js: string
	files: string[]
}

export async function bundle(params: BundleParams): Promise<BundleResult> {
	if (!params.entryPath.startsWith('/')) {
		return await bundle({ ...params, entryPath: `${Deno.cwd()}/${params.entryPath}` })
	}

	const entryUrl = `file://${params.entryPath}`
	const cache = createCache({ cacheSetting: params.shouldRefetchRemote ? 'reloadAll' : 'use' })
	const localFiles: string[] = []

	let code: string
	try {
		const { outputFiles } = await esBuild.build({
			entryPoints: [entryUrl],
			bundle: true,
			outfile: 'bundle',
			plugins: [makeResolver(cache, localFiles)],
			format: 'esm',
			write: false,
		})

		code = outputFiles[0].text
	} catch (_) {
		throw new Error('EsBuild failed. Output should be above')
	}

	const js = `${generateEnvSnippet(params.env)};\n\n(async function(){\n\n${code}\n\n})()`

	return { js, files: localFiles }
}

export interface BundleWatchParams extends BundleParams {
	onBundleReady(js: string, files: string[]): unknown
	onBundleError(error: unknown): void
	abortSignal: AbortSignal
}

export async function bundleWatch(params: BundleWatchParams) {
	const watcher = createWatcher({
		signal: params.abortSignal,
		async onUpdate() {
			await build()
		},
	})

	const build = async () => {
		try {
			const initialBuild = await bundle(params)
			watcher.addFiles(initialBuild.files)
			params.onBundleReady(initialBuild.js, initialBuild.files)
		} catch (error) {
			params.onBundleError(error)
		}
	}

	await build()
}
