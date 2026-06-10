import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error';
import { getWhatsAppChecklist } from '@/server/services/omnichannel-service';

type Params = { params: Promise<{ customerId: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { customerId } = await params;
    const checklist = await getWhatsAppChecklist(customerId);
    return NextResponse.json(checklist);
  } catch (error) {
    return handleApiError(error);
  }
}
