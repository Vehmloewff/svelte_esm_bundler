import { Action } from './strategy.ts'

export async function loadDevopsFile() {
	const module = await import(`file://${Deno.cwd()}/devops.ts`)

	const exposedTasks = Object.keys(module)

	const runAction = async (action: Action) => {
		const fn = module[action.id]
		if (typeof fn !== 'function') throw new Error(`Every export of devops.ts should be a function`)

		await fn(action.arguments)
	}

	return { exposedTasks, runAction }
}
