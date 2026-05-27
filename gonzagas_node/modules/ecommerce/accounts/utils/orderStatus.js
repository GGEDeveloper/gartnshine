/**
 * Traduz estados de pedido/pagamento para PT e devolve classe CSS do badge.
 */

const STATUS_MAP = {
  pending: { label: 'Pendente', badge: 'pending' },
  paid: { label: 'Pago', badge: 'paid' },
  processing: { label: 'Em preparação', badge: 'processing' },
  shipped: { label: 'Enviado', badge: 'shipped' },
  delivered: { label: 'Entregue', badge: 'delivered' },
  cancelled: { label: 'Cancelado', badge: 'cancelled' },
  refunded: { label: 'Reembolsado', badge: 'cancelled' },
  failed: { label: 'Falhou', badge: 'cancelled' },
};

function formatOrderStatus(status) {
  const key = (status || 'pending').toLowerCase();
  return STATUS_MAP[key] || { label: status || '—', badge: 'pending' };
}

function formatPaymentStatus(status) {
  const key = (status || 'pending').toLowerCase();
  if (key === 'paid' || key === 'succeeded') {
    return { label: 'Pago', badge: 'paid' };
  }
  if (key === 'pending') {
    return { label: 'Pendente', badge: 'pending' };
  }
  if (key === 'failed' || key === 'cancelled') {
    return { label: 'Falhou', badge: 'cancelled' };
  }
  return { label: status || '—', badge: 'pending' };
}

module.exports = { formatOrderStatus, formatPaymentStatus };
