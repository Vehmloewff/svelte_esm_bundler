export type Env = 'dev' | 'staging' | 'production'

export let env = getEnv()

function getEnv() {
	const env = Deno.env.get('ENV') || 'dev'
	if (env !== 'dev' && env !== 'staging' && env !== 'production') throw new Error(`Invalid ENV value: ${env}`)

	return env
}

export function setEnv(newEnv: Env) {
	env = newEnv
}
