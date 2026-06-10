import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error';
import { updateExtensionSchema } from '@/lib/validations/telephony';
import { deleteExtension, updateExtension } from '@/server/services/telephony-service';

type Params = { params: Promise<{ customerId: string; extensionId: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { customerId, extensionId } = await params;
    const body = await request.json();
    const input = updateExtensionSchema.parse(body);
    const extension = await updateExtension(customerId, extensionId, input);
    return NextResponse.json(extension);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { customerId, extensionId } = await params;
    await deleteExtension(customerId, extensionId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
