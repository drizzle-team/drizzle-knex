## Drizzle ORM 🤝 Knex

This repo is a [better-sqlite3](https://www.npmjs.com/package/better-sqlite3) Northwind example of how you can use [Knex](https://knexjs.org) with [Drizzle ORM](driz.li/orm) and benefit from both.  
 
At [Drizzle Team](https://drizzle.team) we're aiming change the world of SQL in TypeScript for the better, not build "the only ORM you need".  

We've built module for you to declare Drizzle schema, use drizzle-kit for migrations and have your beloved Knex as a query builder 🚀  

To run this project:
```bash
## we're using pnpm, you can use npm or yarn
npm install
npm run dev
```

You can alter sqlite schema in `src/schema.ts` and just use `npm run generate` to automatically generate all needed SQL alternations.  

```typescript
import Database from "better-sqlite3";
import { customers, details, employees, orders, products, suppliers } from "./schema";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { drizzle } from "drizzle-orm/better-sqlite3/driver";

import { knex } from "knex";
import "drizzle-orm/knex"; // mandatory import

const sqlite = new Database("datapack/_sqlite.db");
const drzldb = drizzle(sqlite);
migrate(drzldb, { migrationsFolder: "drizzle" });

declare module "knex/types/tables" {
  interface Tables {
    customer: Knexify<typeof customers>;
    employee: Knexify<typeof employees>;
    order: Knexify<typeof orders>;
    supplier: Knexify<typeof suppliers>;
    product: Knexify<typeof products>;
    order_detail: Knexify<typeof details>;
  }
}

const db = knex({
  client: "better-sqlite3", // 'sqlite3'
  connection: {
    filename: "nw.sqlite",
  },
});

const main = async () => {
  // fully typed Knex result and query builder
  const result =  await db("customer");

  // you can also query with Drizzle ORM whenever needed!
  const result2 = drzldb.select().from(customers).all()
}

main()
```

If you have an existing Knex based project, you can introspect your existing database with `drizzle-kit` and it will prepare you a complete `schema.ts` based on your current database - [see docs](driz.li/kit)
```bash 
> drizzle-kit introspect:pg ...
> drizzle-kit introspect:mysql ...
> drizzle-kit introspect:sqlite ...
```


