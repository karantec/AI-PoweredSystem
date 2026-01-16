import { db } from '../db/index.js';
import { orders } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export async function getOrderDetails(orderId: string) {
  try {
    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (order.length === 0) {
      return { error: 'Order not found', orderId };
    }

    return {
      orderId: order[0].id,
      status: order[0].status,
      items: order[0].items,
      total: order[0].total,
      trackingNumber: order[0].trackingNumber,
      estimatedDelivery: order[0].estimatedDelivery,
      createdAt: order[0]
    };
  } catch (error) {
    return {
      error: 'Failed to fetch order details',
      orderId,
    };
  }
}

export async function checkDeliveryStatus(orderId: string) {
  try {
    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (order.length === 0) {
      return { error: 'Order not found', orderId };
    }

    const statusMap: Record<string, string> = {
      processing: 'Your order is being prepared',
      shipped: 'Your order is on the way',
      delivered: 'Your order has been delivered',
      cancelled: 'This order was cancelled',
    };

    return {
      orderId: order[0].id,
      currentStatus: order[0].status,
      statusMessage: statusMap[order[0].status] || 'Status unknown',
      trackingNumber: order[0].trackingNumber,
      estimatedDelivery: order[0].estimatedDelivery,
      lastUpdated: order[0],
    };
  } catch (error) {
    return {
      error: 'Failed to check delivery status',
      orderId,
    };
  }
}