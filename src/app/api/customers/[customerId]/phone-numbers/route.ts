import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error';
import { createPhoneNumberSchema } from '@/lib/validations/telephony';
import { createPhoneNumber, listPhoneNumbers } from '@/server/services/telephony-service';

type Params = { params: Promise<{ customerId: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { customerId } = await params;
    const data = await listPhoneNumbers(customerId);
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { customerId } = await params;
    const body = await request.json();
    const input = createPhoneNumberSchema.parse(body);
    const phoneNumber = await createPhoneNumber(customerId, input);
    return NextResponse.json(phoneNumber, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
