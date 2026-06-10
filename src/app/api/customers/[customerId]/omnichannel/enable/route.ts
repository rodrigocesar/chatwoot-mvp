import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error';
import { enableOmnichannel } from '@/server/services/omnichannel-service';

type Params = { params: Promise<{ customerId: string }> };

export async function POST(_request: NextRequest, { params }: Params) {
  try {
    const { customerId } = await params;
    const result = await enableOmnichannel(customerId);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
