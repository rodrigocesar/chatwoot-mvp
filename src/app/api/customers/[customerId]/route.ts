import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error';
import { updateCustomerSchema } from '@/lib/validations/customer';
import { getCustomerById, updateCustomer } from '@/server/services/customer-service';

type Params = { params: Promise<{ customerId: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { customerId } = await params;
    const customer = await getCustomerById(customerId);
    return NextResponse.json(customer);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { customerId } = await params;
    const body = await request.json();
    const input = updateCustomerSchema.parse(body);
    const customer = await updateCustomer(customerId, input);
    return NextResponse.json(customer);
  } catch (error) {
    return handleApiError(error);
  }
}
