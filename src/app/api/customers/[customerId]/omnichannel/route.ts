import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error';
import { getOmnichannelDashboard } from '@/server/services/omnichannel-service';

type Params = { params: Promise<{ customerId: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { customerId } = await params;
    const dashboard = await getOmnichannelDashboard(customerId);
    return NextResponse.json(dashboard);
  } catch (error) {
    return handleApiError(error);
  }
}
