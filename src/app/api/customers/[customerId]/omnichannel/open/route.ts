import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error';
import { getOpenInboxUrl } from '@/server/services/omnichannel-service';

type Params = { params: Promise<{ customerId: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { customerId } = await params;
    const result = await getOpenInboxUrl(customerId);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
