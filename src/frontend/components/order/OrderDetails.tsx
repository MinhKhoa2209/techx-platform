import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Icon from "@/components/ui/Icon";
import { formatDate, formatDateTime, formatUsd } from "@/lib/format";
import { CONTENT, ORDER_STATUS_CONTENT, ROUTES } from "@/lib/site-config";
import type { Order } from "@/lib/types";

export default function OrderDetails({
  order,
  onCopy,
  copied = false,
  compact = false,
}: {
  order: Order;
  onCopy?: () => void;
  copied?: boolean;
  compact?: boolean;
}) {
  const status = ORDER_STATUS_CONTENT[order.status];
  return (
    <section
      className={compact ? "order-details compact" : "order-details"}
      aria-label={CONTENT.order.detailsLabel}
    >
      <div className="order-status-row">
        <Badge variant="success">
          <Icon name="check" size={15} />
          {status.label}
        </Badge>
        <span>{CONTENT.order.created(formatDateTime(order.createdAt))}</span>
      </div>
      <div className="order-reference">
        <div>
          <span>{CONTENT.order.id}</span>
          <code>{order.id}</code>
        </div>
        {onCopy && (
          <button className="btn btn-secondary" type="button" onClick={onCopy}>
            {copied ? CONTENT.order.copied : CONTENT.order.copyId}
          </button>
        )}
      </div>
      <p className="order-status-description">{status.description}</p>
      <ul className="order-items">
        {order.items.map((item) => (
          <li key={item.productId}>
            <img src={item.image} alt="" width={640} height={480} />
            <div>
              <Link href={ROUTES.product(item.productId)}>{item.name}</Link>
              <span>
                {item.sku} · {CONTENT.order.quantity(item.quantity)}
              </span>
            </div>
            <strong>{formatUsd(item.lineTotalCents)}</strong>
          </li>
        ))}
      </ul>
      <dl className="order-totals">
        <div>
          <dt>{CONTENT.cart.subtotal}</dt>
          <dd>{formatUsd(order.subtotalCents)}</dd>
        </div>
        <div>
          <dt>{CONTENT.cart.shipping}</dt>
          <dd>
            {order.shippingCents === 0
              ? CONTENT.common.free
              : formatUsd(order.shippingCents)}
          </dd>
        </div>
        <div>
          <dt>{CONTENT.cart.total}</dt>
          <dd>{formatUsd(order.totalCents)}</dd>
        </div>
      </dl>
      <div className="order-meta-grid">
        <div>
          <Icon name="truck" />
          <span>
            <strong>{CONTENT.order.deliveryWindow}</strong>
            {formatDate(order.estimatedDelivery.from)} –{" "}
            {formatDate(order.estimatedDelivery.to)}
          </span>
        </div>
        <div>
          <Icon name="package" />
          <span>
            <strong>{CONTENT.order.destination}</strong>
            {order.shippingAddress.city}, {order.shippingAddress.region}{" "}
            {order.shippingAddress.postalCode}
          </span>
        </div>
        <div>
          <Icon name="shield" />
          <span>
            <strong>{CONTENT.order.contact}</strong>
            {order.customer.emailMasked}
          </span>
        </div>
      </div>
      <p className="order-expiry">
        {CONTENT.order.expiry(formatDateTime(order.expiresAt))}
      </p>
    </section>
  );
}
