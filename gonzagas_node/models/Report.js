const { pool } = require('../config/database');

class Report {
  static pool = pool;

  /**
   * Margem por peça (produtos ativos)
   */
  static async getProductMargins(limit = 200) {
    try {
      const [rows] = await this.pool.query(
        `SELECT p.id, p.reference, p.name,
                p.sale_price, p.purchase_price, p.current_stock,
                f.name AS family_name,
                ROUND(p.sale_price - p.purchase_price, 2) AS margin,
                CASE WHEN p.purchase_price > 0
                  THEN ROUND((p.sale_price - p.purchase_price) / p.purchase_price * 100, 1)
                  ELSE NULL END AS margin_pct
         FROM products p
         LEFT JOIN product_families f ON p.family_id = f.id
         WHERE p.is_active = 1
         ORDER BY margin_pct DESC NULLS LAST, p.name ASC
         LIMIT ?`,
        [limit]
      );
      return rows;
    } catch (error) {
      console.error('Error in Report getProductMargins:', error);
      return [];
    }
  }

  /**
   * Resumo de pedidos pagos
   */
  static async getOrderStats() {
    const defaults = { total_orders: 0, total_revenue: 0, avg_order_value: 0, total_tax: 0, total_shipping: 0 };
    try {
      const [rows] = await this.pool.query(
        `SELECT
           COUNT(*) AS total_orders,
           COALESCE(SUM(total_amount), 0) AS total_revenue,
           COALESCE(AVG(total_amount), 0) AS avg_order_value,
           COALESCE(SUM(tax_amount), 0) AS total_tax,
           COALESCE(SUM(shipping_amount), 0) AS total_shipping
         FROM orders
         WHERE status IN ('paid','processing','shipped','delivered')`
      );
      return rows[0] || defaults;
    } catch (error) {
      console.error('Error in Report getOrderStats:', error);
      return defaults;
    }
  }

  /**
   * Top produtos vendidos
   */
  static async getTopSoldProducts(limit = 10) {
    try {
      const [rows] = await this.pool.query(
        `SELECT oi.product_name, oi.product_reference,
                SUM(oi.quantity) AS units_sold,
                SUM(oi.total_price) AS revenue
         FROM order_items oi
         JOIN orders o ON o.id = oi.order_id
         WHERE o.status IN ('paid','processing','shipped','delivered')
         GROUP BY oi.product_reference, oi.product_name
         ORDER BY units_sold DESC
         LIMIT ?`,
        [limit]
      );
      return rows;
    } catch (error) {
      console.error('Error in Report getTopSoldProducts:', error);
      return [];
    }
  }

  /**
   * Valor total em inventário (produtos ativos)
   */
  static async getInventoryValue() {
    const defaults = { stock_value_sale: 0, stock_value_cost: 0, total_units: 0 };
    try {
      const [rows] = await this.pool.query(
        `SELECT
           COALESCE(SUM(current_stock * sale_price), 0) AS stock_value_sale,
           COALESCE(SUM(current_stock * purchase_price), 0) AS stock_value_cost,
           SUM(current_stock) AS total_units
         FROM products WHERE is_active = 1`
      );
      return rows[0] || defaults;
    } catch (error) {
      console.error('Error in Report getInventoryValue:', error);
      return defaults;
    }
  }
}

module.exports = Report;
