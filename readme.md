# Devops

A toolset for supercharging developer operations

## CLI Usage

```
USAGE: devops [...tasks] [...options] [...arguments]

Tasks:
  A task is any function or variable exported from \`devops.ts\`. All tasks must
  specified in long option notation (with two dashes), or if it is only one
  letter doing, in alias notation (with one dash). All tasks will be converted
  to camelCase before calling a function.

Options:
  --deploy         Tasks that support a deployment stage should deploy
  --reload         Tasks that supports should reload any locally cached remote
                   dependencies
  --production     Notify the tasks that they are running in a production
                   environment.
  --staging        Notify the tasks that they are running in a staging
                   environment.
  --verbose        Display a verbose amount of logs
  --quiet          Log as little as possible

Arguments:
  Because all the CLI inputs so far have been in the form of traditional CLI
  options, any traditional arguments will be passed directly to the tasks first
  arguments as an  array of strings.

  If multiple tasks are being executed, arguments can be prefixed with a task
  name (as defined in the devops.ts file), followed by two colons. This
  signifies that the argument should only be passed into that particular task.

Examples:
  Run the \`webApp\` task in a dev environment, reloading any cached remote dependencies, and passing
  in the single argument "5000".
  
  > devops --web-app --reload 3000

  Run the \`ci\` task in staging environment

  > devops --ci --staging

  Run the \`ios\` task in production, telling the task that it must also perform
  a deployment.

  > devops --ios --production --deploy

  Run the \`ios\`, \`android\`, \`w\`, \`s\`, and \`mac\` tasks in development, sending
  an argument of "81810jvn2u2j" to all tasks, and an additional argument of
  "8000" to the \`s\` task only.

  > devops --ios --android -ws --mac 81810jvn2u2j s::8000
```

### No Tasks

If no tasks are specified, the default export of the `devops.ts` file will be called like a task.

### Environments

The environment is always "development" unless the `--staging` or `--production` flags are passed.

### Log Verb

The log verb is always "normal" unless the `--quiet` or `--verbose` flags are passed.
