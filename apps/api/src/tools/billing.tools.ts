import { db } from '../db/index.js';
import { invoices, refunds } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export async function getInvoiceDetails(invoiceId: string) {
  try {
    const invoice = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, invoiceId))
      .limit(1);

    if (invoice.length === 0) {
      return { error: 'Invoice not found', invoiceId };
    }

    return {
      invoiceId: invoice[0].id,
      orderId: invoice[0].orderId,
      amount: invoice[0].amount,
      status: invoice[0].status,
      dueDate: invoice[0].dueDate,
      paidDate: invoice[0].paidDate,
      createdAt: invoice[0],
    };
  } catch (error) {
    return {
      error: 'Failed to fetch invoice details',
      invoiceId,
    };
  }
}

export async function checkRefundStatus(refundId: string) {
  try {
    const refund = await db
      .select()
      .from(refunds)
      .where(eq(refunds.id, refundId))
      .limit(1);

    if (refund.length === 0) {
      return { error: 'Refund not found', refundId };
    }

    const statusMessages: Record<string, string> = {
      pending: 'Your refund request is being reviewed',
      approved: 'Your refund has been approved and will be processed soon',
      completed: 'Your refund has been processed',
      rejected: 'Your refund request was not approved',
    };

    return {
      refundId: refund[0].id,
      invoiceId: refund[0].invoiceId,
      amount: refund[0].amount,
      status: refund[0].status,
      statusMessage: statusMessages[refund[0].status] || 'Status unknown',
      reason: refund[0].reason,
      processedDate: refund[0].processedDate,
      createdAt: refund[0],
    };
  } catch (error) {
    return {
      error: 'Failed to check refund status',
      refundId,
    };
  }
}
