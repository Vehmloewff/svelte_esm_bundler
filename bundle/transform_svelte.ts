import { addTrailingLog, removeTrailingLog } from './code.ts'
import { esBuild, compileSvelte, preprocessSvelte, unwindCompiler } from './deps.ts'

export interface SvelteTransformation {
	contents?: string
}

export async function transformSvelte(code: string, url: URL): Promise<SvelteTransformation> {
	const filepath = url.pathname
	const filename = url.protocol === 'file:' ? filepath : url.toString()

	// This converts a message in Svelte's format to esbuild's format
	// bee-deno-lint-ignore no-explicit-any
	// const convertMessage = ({ message, start, end }: any) => {
	// 	let location
	// 	if (start && end) {
	// 		const lineText = code.split(/\r\n|\r|\n/g)[start.line - 1]
	// 		const lineEnd = start.line === end.line ? end.column : lineText.length
	// 		location = {
	// 			file: url.toString(),
	// 			line: start.line,
	// 			column: start.column,
	// 			length: lineEnd - start.column,
	// 			lineText,
	// 		}
	// 	}
	// 	return { text: message, location }
	// }

	// Insert unwind runtime callers
	code = unwindCompiler.insertUnwindHooks(code, {})

	// Convert Svelte syntax to JavaScript
	const transformation = await (async (): Promise<SvelteTransformation> => {
		try {
			const preprocessed = await preprocessSvelte(code, [{ script: preprocessScript }])
			const { js } = compileSvelte(preprocessed.code, { filename, sveltePath: 'https://cdn.skypack.dev/svelte@3.49.0' })

			return { contents: js!.code }
		} catch (e) {
			throw e
		}
	})()

	return transformation
}

interface PreprocessScriptParams {
	content: string
	attributes: Record<string, string>
}

async function preprocessScript({ content, attributes }: PreprocessScriptParams) {
	if (attributes.lang !== 'ts') return

	// There is a potential for a rather large issue here.  esBuild removes all unused imports.
	// While this is generally a very nice optimization to add to the project, in this case it could be problematic.
	// Not all vars imported in the <script> portion of a svelte file are referenced in that script portion
	// Some of them are only referenced in the template.  When you are only looking at the script, it may seem like
	// imports are unused when they are really in the template, we just can't see them.
	// To solve this issue, we do a simple search through the code and create a large console.log at the bottom of the file
	// that logs all variables.  This makes esBuild think that we are using all those variables.
	// But because we don't actually want to log all the variables, we remove that log as soon as esBuild has finished

	// And as far as the performance aspect of removing all unused imports, it will actually still happen...
	// esBuild will run on the code that has been spit out of the svelte compiler.  This won't have the same potential issue
	// that we have here because the output of the svelte compiler includes both the template and the script.
	const allVarsReferencedCode = addTrailingLog(content)
	const res = await esBuild.transform(allVarsReferencedCode, { loader: 'ts', treeShaking: false })

	res.code = removeTrailingLog(res.code)

	return res
}
