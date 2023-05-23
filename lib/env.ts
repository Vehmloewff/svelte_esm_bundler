export type Env = 'dev' | 'staging' | 'production'

const stashedEnvs = new Map<string, Env>()
let lookedAtEnvVar = false

export function getEnv(scope: string): Env {
	const stashedEnv = stashedEnvs.get(scope)
	if (stashedEnv) return stashedEnv

	if (!lookedAtEnvVar) {
		const envVarString = Deno.env.get('ENV')
		if (envVarString) populateEnvString(envVarString)

		lookedAtEnvVar = true
		return getEnv(scope)
	}

	stashedEnvs.set(scope, 'production')
	return 'production'
}

function populateEnvString(env: string) {
	const sections = env.split(',').map((str) => str.trim())

	for (const [sectionScope, sectionEnv] of sections) {
		if (!sectionEnv) throw new Error(`Expected section in ENV var to be a key=value pair, but found: "${sectionScope}"`)
		if (sectionEnv !== 'dev' && sectionEnv !== 'staging' && sectionEnv !== 'production') {
			throw new Error(`Invalid ENV value for key ${sectionScope}: ${env}`)
		}

		stashedEnvs.set(sectionScope, sectionEnv)
	}
}
