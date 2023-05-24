import { asserts, shCapture } from './deps.ts'

Deno.test('cli runs example', async () => {
	const { logLines } = await shCapture('deno run -A ../main.ts --foo', { cwd: 'example', suppressColor: true })

	asserts.assert(logLines.includes('devops foo'))
})
