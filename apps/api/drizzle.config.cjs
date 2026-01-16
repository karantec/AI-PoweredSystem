/** @type {import('drizzle-kit').Config} */
module.exports = {
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://postgres:root@localhost:5432/customer_support",
  },
};
