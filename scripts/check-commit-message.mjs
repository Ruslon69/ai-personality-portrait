const message = process.argv.slice(2).join(' ').trim();
const allowed =
  /^(?:feat|fix|refactor|test|docs|chore|build|ci|perf|style|revert)(?:\([a-z0-9._/-]+\))?!?: [^\s].{0,99}$/;

if (!allowed.test(message) || /[\r\n]/.test(message)) {
  process.stderr.write(
    'Invalid commit message. Use: type(optional-scope): concise description (max 100 subject characters).\n',
  );
  process.exitCode = 1;
} else process.stdout.write('Commit message is valid.\n');
