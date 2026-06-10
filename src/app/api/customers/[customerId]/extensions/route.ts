import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error';
import { createExtensionSchema } from '@/lib/validations/telephony';
import { createExtension, listExtensions } from '@/server/services/telephony-service';

type Params = { params: Promise<{ customerId: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { customerId } = await params;
    const data = await listExtensions(customerId);
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { customerId } = await params;
    const body = await request.json();
    const input = createExtensionSchema.parse(body);
    const extension = await createExtension(customerId, input);
    return NextResponse.json(extension, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
