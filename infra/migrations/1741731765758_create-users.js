const { unique } = require("next/dist/build/utils");

exports.up = (pgm) => {
  pgm.createTable("users", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },

    // For reference, GitHub usernames can have up to 39 characters.
    username: {
      type: "varchar(30)",
      notNull: true,
      unique: true,
    },

    // Why to use varchar(254) for email? https://stackoverflow.com/a/1199238
    email: {
      type: "varchar(254)",
      notNull: true,
      unique: true,
    },

    // Why to use varchar(72) for password? https://security.stackexchange.com/a/398
    password: {
      type: "varchar(72)",
      notNull: true,
    },

    // Why to use timestamptz instead of timestamp? https://stackoverflow.com/a/2535927
    created_at: {
      type: "timestamptz",
      default: pgm.func("now()"),
    },

    updated_at: {
      type: "timestamptz",
      default: pgm.func("now()"),
    },
  });
};

exports.down = false;
