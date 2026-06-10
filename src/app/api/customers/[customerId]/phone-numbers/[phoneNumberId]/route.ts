import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error';
import { updatePhoneNumberSchema } from '@/lib/validations/telephony';
import { deletePhoneNumber, updatePhoneNumber } from '@/server/services/telephony-service';

type Params = { params: Promise<{ customerId: string; phoneNumberId: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { customerId, phoneNumberId } = await params;
    const body = await request.json();
    const input = updatePhoneNumberSchema.parse(body);
    const phoneNumber = await updatePhoneNumber(customerId, phoneNumberId, input);
    return NextResponse.json(phoneNumber);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { customerId, phoneNumberId } = await params;
    await deletePhoneNumber(customerId, phoneNumberId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
