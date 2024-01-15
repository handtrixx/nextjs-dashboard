const { Pool } = require('pg');
// Create a pool instance and pass in our config, which we set in our env vars
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB,
});

const {
  invoices,
  customers,
  revenue,
  users,
} = require('../app/lib/placeholder-data.js');

const bcrypt = require('bcrypt');

async function seedUsers() {
  try {
    await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    // Create the "users" table if it doesn't exist
    const createTable = await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `);

    console.log(`Created "users" table`);

    //truncate table conntent
    const truncateUsers = await pool.query(`
        TRUNCATE TABLE users
      `);
    console.log(`Truncated "users" table`);

    // Insert data into the "users" table
    const insertedUsers = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return pool.query(
          `
        INSERT INTO users (id, name, email, password)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO NOTHING;
      `,
          [user.id, user.name, user.email, hashedPassword],
        );
      }),
    );

    console.log(`Seeded ${insertedUsers.length} users`);

    return {
      createTable,
      users: insertedUsers,
    };
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
}
async function seedInvoices() {
  try {
    await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // Create the "invoices" table if it doesn't exist
    const createTable = await pool.query(`
      CREATE TABLE IF NOT EXISTS invoices (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      customer_id UUID NOT NULL,
      amount INT NOT NULL,
      status VARCHAR(255) NOT NULL,
      date DATE NOT NULL
    );
  `);

    console.log(`Created "invoices" table`);

    //truncate table conntent
    const truncateInvoices = await pool.query(`
      TRUNCATE TABLE invoices
    `);
    console.log(`Truncated "invoices" table`);

    // Insert data into the "invoices" table
    const insertedInvoices = await Promise.all(
      invoices.map((invoice) =>
        pool.query(
          `
          INSERT INTO invoices (customer_id, amount, status, date)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (id) DO NOTHING;
        `,
          [invoice.customer_id, invoice.amount, invoice.status, invoice.date],
        ),
      ),
    );

    console.log(`Seeded ${insertedInvoices.length} invoices`);

    return {
      createTable,
      invoices: insertedInvoices,
    };
  } catch (error) {
    console.error('Error seeding invoices:', error);
    throw error;
  }
}

async function seedCustomers() {
  try {
    await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // Create the "customers" table if it doesn't exist
    const createTable = await pool.query(`
        CREATE TABLE IF NOT EXISTS customers (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          image_url VARCHAR(255) NOT NULL
        );
      `);

    console.log(`Created "customers" table`);

    //truncate table conntent
    const truncateCustomers = await pool.query(`
        TRUNCATE TABLE customers
      `);
    console.log(`Truncated "customers" table`);

    // Insert data into the "customers" table
    const insertedCustomers = await Promise.all(
      customers.map(async (customer) => {
        const query = {
          text: `
                INSERT INTO customers (id, name, email, image_url)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (id) DO NOTHING;
              `,
          values: [
            customer.id,
            customer.name,
            customer.email,
            customer.image_url,
          ],
        };
        return pool.query(query);
      }),
    );

    console.log(`Seeded ${insertedCustomers.length} customers`);
    return {
      createTable,
      customers: insertedCustomers,
    };
  } catch (error) {
    console.error('Error seeding customers:', error);
    throw error;
  }
}
async function seedRevenue() {
  try {
    // Create the "revenue" table if it doesn't exist
    const createTable = await pool.query(`
        CREATE TABLE IF NOT EXISTS revenue (
          month VARCHAR(4) NOT NULL UNIQUE,
          revenue INT NOT NULL
        );
      `);

    console.log(`Created "revenue" table`);

        //truncate table conntent
        const truncateRevenue= await pool.query(`
        TRUNCATE TABLE revenue
      `);
    console.log(`Truncated "revenue" table`);

    // Insert data into the "revenue" table
    const insertedRevenue = await Promise.all(
      revenue.map(async (rev) => {
        const query = {
          text: `
                INSERT INTO revenue (month, revenue)
                VALUES ($1, $2)
                ON CONFLICT (month) DO NOTHING;
              `,
          values: [rev.month, rev.revenue],
        };
        return pool.query(query);
      }),
    );

    console.log(`Seeded ${insertedRevenue.length} revenue`);

    return {
      createTable,
      revenue: insertedRevenue,
    };
  } catch (error) {
    console.error('Error seeding revenue:', error);
    throw error;
  }
}

async function main() {
  await seedUsers();
  await seedCustomers();
  await seedInvoices();
  await seedRevenue();
  await pool.end();
}

main().catch((err) => {
  console.error(
    'An error occurred while attempting to seed the database:',
    err,
  );
});
