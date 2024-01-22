import { formatCurrency } from './utils';
import { unstable_noStore as noStore } from 'next/cache';
import { db } from './database';
import { sql } from 'kysely';

export async function fetchRevenue() {
  // Add noStore() here prevent the response from being cached.
  // This is equivalent to in fetch(..., {cache: 'no-store'}).
  noStore();
  try {
    console.log('Fetching revenue data...');
    const rows = await db.selectFrom('revenue').selectAll().execute();
    return rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {
  noStore();
  try {
    const data = await db
      .selectFrom(['invoices', 'customers'])
      .whereRef('invoices.customer_id', '=', 'customers.id')
      .select([
        'invoices.id',
        'invoices.date',
        'invoices.amount',
        'customers.name',
        'customers.image_url',
        'customers.email',
      ])
      .orderBy('invoices.date desc')
      .limit(5)
      .execute();

    const latestInvoices = data.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
  noStore();
  try {
    const invoiceCountPromise = await db
      .selectFrom('invoices')
      .select(db.fn.countAll().as('count'))
      .executeTakeFirstOrThrow();
    const customerCountPromise = await db
      .selectFrom('customers')
      .select(db.fn.countAll().as('count'))
      .executeTakeFirstOrThrow();
    const invoiceStatusPromise = await db
      .selectFrom('invoices')
      .select([
        sql<string>`SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END)`.as(
          'paid',
        ),
        sql<string>`SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END)`.as(
          'pending',
        ),
      ])
      .execute();

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(data[0].count ?? '0');
    const numberOfCustomers = Number(data[1].count ?? '0');
    const totalPaidInvoices = formatCurrency(data[2][0].paid ?? '0');
    const totalPendingInvoices = formatCurrency(data[2][0].pending ?? '0');

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  noStore();
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await db
      .selectFrom(['invoices', 'customers'])
      .whereRef('invoices.customer_id', '=', 'customers.id')
      .select([
        'invoices.id',
        'invoices.amount',
        'invoices.date',
        'invoices.status',
        'customers.name',
        'customers.email',
        'customers.image_url',
      ])
      .where((eb) =>
        eb.or([
          eb(sql`customers.name`, 'ilike', '%' + query + '%'),
          eb(sql`customers.email`, 'ilike', '%' + query + '%'),
          eb(sql`invoices.amount::text`, 'ilike', '%' + query + '%'),
          eb(sql`invoices.date::text`, 'ilike', '%' + query + '%'),
          eb(sql`invoices.status`, 'ilike', '%' + query + '%'),
        ]),
      )
      .orderBy('invoices.date desc')
      .limit(ITEMS_PER_PAGE)
      .offset(offset)
      .execute();
    return invoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    noStore();

    const count = await db
      .selectFrom(['invoices', 'customers'])
      .whereRef('invoices.customer_id', '=', 'customers.id')
      .select(db.fn.countAll().as('count'))
      .where((eb) =>
        eb.or([
          eb(sql`customers.name`, 'ilike', '%' + query + '%'),
          eb(sql`customers.email`, 'ilike', '%' + query + '%'),
          eb(sql`invoices.amount::text`, 'ilike', '%' + query + '%'),
          eb(sql`invoices.date::text`, 'ilike', '%' + query + '%'),
          eb(sql`invoices.status`, 'ilike', '%' + query + '%'),
        ]),
      )
      .executeTakeFirstOrThrow();

    const totalPages = Math.ceil(Number(count.count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  noStore();
  try {
    const data = await db
      .selectFrom('invoices')
      .select([
        'invoices.id',
        'invoices.customer_id',
        'invoices.amount',
        'invoices.status',
      ])
      .where('invoices.id', '=', id)
      .executeTakeFirst();

    const invoice = {};
    invoice.amount = data.amount / 100;
    invoice.id = data.id;
    invoice.customer_id = data.customer_id;
    invoice.status = data.status;

    return invoice;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomers() {
  try {
    const data = await db
      .selectFrom('customers')
      .select(['id', 'name'])
      .orderBy('name asc')
      .execute();

    const customers = data;
    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(query: string) {
  noStore();
  try {

    const data = await db
      .selectFrom(['customers', 'invoices'])
      .whereRef('invoices.customer_id', '=', 'customers.id')
      .select([
        'customers.id',
        'customers.name',
        'customers.email',
        'customers.image_url',
        sql<string>`COUNT(invoices.id)`.as('total_invoices'),
        sql<string>`SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END)`.as(
          'total_pending',
        ),
        sql<string>`SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END)`.as(
          'total_paid',
        ),
      ])
      .where((eb) =>
        eb.or([
          eb(sql`customers.name`, 'ilike', '%' + query + '%'),
          eb(sql`customers.email`, 'ilike', '%' + query + '%'),
        ]),
      )
      .groupBy('customers.id')
      .groupBy('customers.name')
      .groupBy('customers.email')
      .groupBy('customers.image_url')
      .orderBy('customers.name asc')
      .execute();

    const customers = data.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}

export async function getUser(email: string) {
  try {
    const user = await db
      .selectFrom('users')
      .selectAll()
      .whereRef('email', '=', email)
      .executeTakeFirst();
    return user as User;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}
