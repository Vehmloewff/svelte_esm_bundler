import { setEnv, setLogVerb } from './deps.ts'
import { Strategy } from './strategy.ts'

export let shouldReload = false
export let shouldDeploy = false

export function setConfigurations(strategy: Strategy) {
	setEnv(strategy.environment)
	setLogVerb(strategy.logVerb)
	shouldDeploy = strategy.shouldDeploy
	shouldReload = strategy.shouldReload
}
