import { db } from '@/lib/db';
import { getCustomerById } from './customer-service';

export async function listPhoneNumbers(customerId: string) {
  await getCustomerById(customerId);
  return db.phoneNumber.findMany({
    where: { customerId },
    orderBy: { createdAt: 'asc' },
  });
}

export async function createPhoneNumber(
  customerId: string,
  data: { e164Number: string; label: string; status: 'active' | 'inactive' | 'pending' },
) {
  await getCustomerById(customerId);
  return db.phoneNumber.create({
    data: { ...data, customerId },
  });
}

export async function updatePhoneNumber(
  customerId: string,
  phoneNumberId: string,
  data: Partial<{ e164Number: string; label: string; status: 'active' | 'inactive' | 'pending' }>,
) {
  const existing = await db.phoneNumber.findFirst({
    where: { id: phoneNumberId, customerId },
  });
  if (!existing) throw new Error('NOT_FOUND');
  return db.phoneNumber.update({
    where: { id: phoneNumberId },
    data,
  });
}

export async function deletePhoneNumber(customerId: string, phoneNumberId: string) {
  const existing = await db.phoneNumber.findFirst({
    where: { id: phoneNumberId, customerId },
  });
  if (!existing) throw new Error('NOT_FOUND');
  await db.phoneNumber.delete({ where: { id: phoneNumberId } });
}

export async function listExtensions(customerId: string) {
  await getCustomerById(customerId);
  return db.extension.findMany({
    where: { customerId },
    orderBy: { extensionNumber: 'asc' },
  });
}

export async function createExtension(
  customerId: string,
  data: {
    extensionNumber: string;
    displayName: string;
    assignedUserName?: string;
    status: 'active' | 'inactive';
  },
) {
  await getCustomerById(customerId);
  return db.extension.create({
    data: { ...data, customerId },
  });
}

export async function updateExtension(
  customerId: string,
  extensionId: string,
  data: Partial<{
    extensionNumber: string;
    displayName: string;
    assignedUserName: string;
    status: 'active' | 'inactive';
  }>,
) {
  const existing = await db.extension.findFirst({
    where: { id: extensionId, customerId },
  });
  if (!existing) throw new Error('NOT_FOUND');
  return db.extension.update({
    where: { id: extensionId },
    data,
  });
}

export async function deleteExtension(customerId: string, extensionId: string) {
  const existing = await db.extension.findFirst({
    where: { id: extensionId, customerId },
  });
  if (!existing) throw new Error('NOT_FOUND');
  await db.extension.delete({ where: { id: extensionId } });
}
