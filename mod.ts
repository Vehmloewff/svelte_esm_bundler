export type TasksHandler = () => unknown

export interface TasksConfig {
	alias: Record<string, string>
	handlers: Record<string, TasksHandler>
}

export async function runTasks(config: TasksConfig) {}
