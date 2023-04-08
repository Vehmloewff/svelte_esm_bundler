// deno-lint-ignore-file no-explicit-any

import { colors } from './deps.ts'

export type LogVerb = 'normal' | 'verbose' | 'quiet'

export let logVerb: LogVerb = 'normal'

export function setLogVerb(newVerb: LogVerb) {
	logVerb = newVerb
}

export function log(...data: any[]) {
	console.log(colors.cyan(colors.bold('devops')), ...data)
}
