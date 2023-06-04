import { colors } from './deps.ts'

export function log(message: string) {
	console.log(colors.cyan(colors.bold('devops')), message)
}
