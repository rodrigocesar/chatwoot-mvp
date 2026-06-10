import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  const existing = await db.customer.findFirst({
    where: { companyName: 'Clínica Exemplo' },
  });

  if (existing) {
    console.log('Seed skipped: Clínica Exemplo already exists');
    return;
  }

  await db.customer.create({
    data: {
      companyName: 'Clínica Exemplo',
      country: 'BR',
      subscriptionStatus: 'active',
      omnichannelEnabled: false,
    },
  });

  console.log('Seeded demo customer: Clínica Exemplo');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
