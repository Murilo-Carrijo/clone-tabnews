const { exec } = require("node:child_process");

const checkPostgres = () => {
  exec(
    "docker exec postgres-dev pg_isready --host localhost",
    /* eslint-disable no-unused-vars */
    (_error, stdout, _stderr) => {
      if (stdout.search("accepting connections") === -1) {
        process.stdout.write(".");
        checkPostgres();
        return;
      }
      console.log("!");
      console.log("\n🟢 PostgreSQL is ready\n\n");
    },
  );
};

process.stdout.write("\n\n🔴 Waiting for PostgreSQL to become available...");
checkPostgres();
