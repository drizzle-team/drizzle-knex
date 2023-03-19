import Database from "better-sqlite3";
import "drizzle-orm/knex";
import {
  customers,
  details,
  employees,
  orders,
  products,
  suppliers,
} from "./schema";

import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { drizzle } from "drizzle-orm/better-sqlite3/driver";
import {
  customerIds,
  customerSearches,
  employeeIds,
  orderIds,
  productIds,
  productSearches,
  supplierIds,
} from "./meta";
import { knex } from "knex";
import { ConsoleLogWriter } from "drizzle-orm";

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
    filename: "datapack/_sqlite.db",
  },
  useNullAsDefault: true
});

const main = async () => {
  const res = await db("customer");
  
  const drizzleRes = drzldb.select().from(customers).all();

  for (const id of customerIds) {
    const res = await db("customer").where({ id }).first();
  }

  for (const it of customerSearches) {
    const res = await db("customer").whereRaw("LOWER(company_name) LIKE ?", [
      `%${it}%`,
    ]);
  }

  const res2 = await db("employee");

  for (const id of employeeIds) {
    const res = await db("employee as e1")
      .select([
        "e1.*",
        "e2.id as e2_id",
        "e2.last_name as e2_last_name",
        "e2.first_name as e2_first_name",
        "e2.title as e2_title",
        "e2.title_of_courtesy as e2_title_of_courtesy",
        "e2.birth_date as e2_birth_date",
        "e2.hire_date as e2_hire_date",
        "e2.address as e2_address",
        "e2.city as e2_city",
        "e2.postal_code as e2_postal_code",
        "e2.country as e2_country",
        "e2.home_phone as e2_home_phone",
        "e2.extension as e2_extension",
        "e2.notes as e2_notes",
        "e2.reports_to as e2_reports_to",
      ])
      .whereRaw("e1.id = ?", [id])
      .leftJoin("employee as e2", "e1.reports_to", "e2.id");
  }

  const res3 = await db("supplier");

  for (const id of supplierIds) {
    await db("supplier").where({ id }).first();
  }

  const res4 = await db("product");

  for (const id of productIds) {
    const res = await db("product")
      .select([
        "product.*",
        "supplier.id as s_id",
        "company_name",
        "contact_name",
        "contact_title",
        "address",
        "city",
        "region",
        "postal_code",
        "country",
        "phone",
      ])
      .whereRaw("product.id = ?", [id])
      .leftJoin("supplier", "supplier.id", "product.supplier_id");
  }

  for (const it of productSearches) {
    await db("product").whereRaw("LOWER(name) LIKE ?", [`%${it}%`]);
  }

  await db("order")
    .select([
      "order.id",
      "order.shipped_date",
      "order.ship_name",
      "order.ship_city",
      "order.ship_country",
    ])
    .leftJoin("order_detail", "order_detail.order_id", "order.id")
    .count("product_id as products_count")
    .sum("quantity as quantity_sum")
    .sum({ total_price: db.raw("?? * ??", ["quantity", "unit_price"]) })
    .groupBy("order.id")
    .orderBy("order.id", "asc");

  for (const id of orderIds) {
    await db("order_detail")
      .select([
        "order_detail.*",
        "order.id as o_id",
        "order_date",
        "required_date",
        "shipped_date",
        "ship_via",
        "freight",
        "ship_name",
        "ship_city",
        "ship_region",
        "ship_postal_code",
        "ship_country",
        "customer_id",
        "employee_id",
        "product.id as p_id",
        "name",
        "quantity_per_unit",
        "product.unit_price as p_unit_price",
        "units_in_stock",
        "units_on_order",
        "reorder_level",
        "discontinued",
        "supplier_id",
      ])
      .whereRaw("order_detail.order_id = ?", id)
      .leftJoin("product", "product.id", "order_detail.product_id")
      .leftJoin("order", "order.id", "order_detail.order_id");
  }
  process.exit(0)
};

main();
