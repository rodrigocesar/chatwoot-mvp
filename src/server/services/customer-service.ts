import { db } from '@/lib/db';
import type { CreateCustomerInput, UpdateCustomerInput } from '@/lib/validations/customer';

export async function listCustomers() {
  return db.customer.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      companyName: true,
      country: true,
      subscriptionStatus: true,
      omnichannelEnabled: true,
      chatwootAccountId: true,
      createdAt: true,
    },
  });
}

export async function getCustomerById(customerId: string) {
  const customer = await db.customer.findUnique({
    where: { id: customerId },
    include: {
      _count: {
        select: {
          phoneNumbers: true,
          extensions: true,
          agents: true,
        },
      },
    },
  });

  if (!customer) {
    throw new Error('NOT_FOUND');
  }

  return customer;
}

export async function createCustomer(input: CreateCustomerInput) {
  return db.customer.create({
    data: input,
  });
}

export async function updateCustomer(customerId: string, input: UpdateCustomerInput) {
  await getCustomerById(customerId);
  return db.customer.update({
    where: { id: customerId },
    data: input,
  });
}
