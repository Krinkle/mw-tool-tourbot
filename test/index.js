function progress () {
  process.stdout.write('.');
}

async function main () {
  try {
    for (let fns of [
      require('./diff'),
      require('./content'),
      require('./replace'),
      require('./fixer'),
      require('./patterns')
    ]) {
      if (typeof fns === 'function') {
        fns = { [fns.name]: fns };
      }
      for (let name in fns) {
        let fn = fns[name];
        if (fn.length) {
          // Render with progres dots
          process.stdout.write(name + ' ');
          await fn(progress);
          process.stdout.write('\n');
        } else {
          process.stdout.write(name + '\n');
          await fn();
        }
      }
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
