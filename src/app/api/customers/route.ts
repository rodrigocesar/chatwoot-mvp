import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error';
import { createCustomerSchema } from '@/lib/validations/customer';
import { createCustomer, listCustomers } from '@/server/services/customer-service';

export async function GET() {
  try {
    const data = await listCustomers();
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = createCustomerSchema.parse(body);
    const customer = await createCustomer(input);
    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
