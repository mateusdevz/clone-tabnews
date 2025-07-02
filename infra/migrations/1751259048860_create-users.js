exports.up = (pgm) => {
  pgm.createTable("users", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    // For reference, Github limits usernames to 39 characarters.
    username: {
      type: "varchar(30)",
      notNull: true,
      unique: true,
    },
    // Why 254 for length? https://stackoverflow.com/questions/1199190/what-is-the-optimal-length-for-an-email-address-in-a-database/1199238#1199238
    email: {
      type: "varchar(254)",
      notNull: true,
      unique: true,
    },
    //  Why 60 for length?  https://www.npmjs.com/package/bcrypt#hash-info
    password: {
      type: "varchar(60)",
      notNull: true,
    },
    //  Why timestamp with timezone?  https://justatheory.com/2012/04/postgres-use-timestamptz/
    created_at: {
      type: "timestamptz",
      default: pgm.func("timezone('utc', now())"),
      notNull: true,
    },
    updated_at: {
      type: "timestamptz",
      default: pgm.func("timezone('utc', now())"),
      notNull: true,
    },
  });
};

exports.down = false;
