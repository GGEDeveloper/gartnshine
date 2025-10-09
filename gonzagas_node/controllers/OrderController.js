/**
 * Order Controller - Dark Nature E-commerce
 * Handles order processing, confirmation, and tracking
 */

const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
// Note: Email functionality requires nodemailer configuration in .env

class OrderController {
    
    /**
     * Process new order from checkout
     */
    static async processOrder(req, res) {
        let connection;
        
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();
            
            const { customerInfo, shippingInfo, paymentInfo, cartItems, totals } = req.body;
            
            // Validate required data
            if (!customerInfo?.email || !customerInfo?.name || !cartItems || cartItems.length === 0) {
                throw new Error('Dados incompletos para processar pedido');
            }
            
            // Generate order number
            const orderNumber = 'GZ' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 100);
            
            // Create order
            const [orderResult] = await connection.execute(
                `INSERT INTO orders (
                    order_number, customer_email, customer_name, customer_phone,
                    customer_address, customer_city, customer_postal_code, customer_stone_preference,
                    subtotal_amount, shipping_amount, total_amount,
                    payment_method, shipping_method, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    orderNumber,
                    customerInfo.email,
                    customerInfo.name,
                    customerInfo.phone || null,
                    shippingInfo?.address || '',
                    shippingInfo?.city || '',
                    shippingInfo?.postalCode || '',
                    customerInfo.stonePreference || null,
                    totals.subtotal,
                    totals.shipping,
                    totals.total,
                    paymentInfo.method,
                    shippingInfo?.method || 'standard',
                    'pending'
                ]
            );
            
            const orderId = orderResult.insertId;
            
            // Create order items with product snapshot
            for (const item of cartItems) {
                // Get product details for snapshot
                const [productRows] = await connection.execute(
                    'SELECT name, slug, stone_type, reference FROM products WHERE id = ?',
                    [item.productId]
                );
                
                const product = productRows[0];
                
                await connection.execute(
                    `INSERT INTO order_items (
                        order_id, product_id, quantity, unit_price, total_price,
                        product_name, product_image, stone_type, product_sku
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        orderId,
                        item.productId,
                        item.quantity,
                        item.productPrice,
                        item.productPrice * item.quantity,
                        product?.name || item.productName,
                        item.productImage || null,
                        product?.stone_type || null,
                        product?.reference || null
                    ]
                );
            }
            
            await connection.commit();
            
            // Log activity if middleware available
            if (req.logActivity) {
                req.logActivity('order_created', 'order', orderId, `Order ${orderNumber} created`);
            }
            
            // Clear cart session
            if (req.session.cart) {
                req.session.cart = [];
            }
            
            res.json({
                success: true,
                orderNumber,
                orderId,
                redirectUrl: `/order-confirmation/${orderNumber}`
            });
            
        } catch (error) {
            if (connection) {
                await connection.rollback();
            }
            console.error('Process order error:', error);
            
            res.status(500).json({
                success: false,
                error: error.message || 'Erro ao processar pedido'
            });
            
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }
    
    /**
     * Show order confirmation page
     */
    static async showConfirmation(req, res) {
        try {
            const { orderNumber } = req.params;
            
            const [orderRows] = await pool.execute(
                `SELECT o.*, 
                 GROUP_CONCAT(
                     CONCAT(oi.product_name, '|', oi.quantity, '|', oi.unit_price, '|', oi.product_image)
                     SEPARATOR ';;'
                 ) as items
                 FROM orders o
                 LEFT JOIN order_items oi ON o.id = oi.order_id
                 WHERE o.order_number = ?
                 GROUP BY o.id`,
                [orderNumber]
            );
            
            if (orderRows.length === 0) {
                return res.status(404).render('error', {
                    error: 'Pedido não encontrado',
                    layout: false
                });
            }
            
            const order = orderRows[0];
            
            // Parse items
            const items = order.items ? order.items.split(';;').map(item => {
                const [name, quantity, price, image] = item.split('|');
                return {
                    name,
                    quantity: parseInt(quantity),
                    price: parseFloat(price),
                    image: image !== 'null' ? image : null
                };
            }) : [];
            
            res.render('pages/order-confirmation-dark-nature', {
                currentPage: 'order-confirmation',
                title: `Pedido ${orderNumber} Confirmado - Gonzaga Art & Shine`,
                layout: false,
                order: {
                    ...order,
                    items
                }
            });
            
        } catch (error) {
            console.error('Show confirmation error:', error);
            res.status(500).render('error', {
                error: 'Erro ao carregar confirmação',
                layout: false
            });
        }
    }
    
    /**
     * Show order tracking page
     */
    static async showTracking(req, res) {
        try {
            const { orderNumber } = req.params;
            
            const [orderRows] = await pool.execute(
                `SELECT o.*, 
                 GROUP_CONCAT(
                     CONCAT(oi.product_name, '|', oi.quantity, '|', oi.unit_price)
                     SEPARATOR ';;'
                 ) as items
                 FROM orders o
                 LEFT JOIN order_items oi ON o.id = oi.order_id
                 WHERE o.order_number = ?
                 GROUP BY o.id`,
                [orderNumber]
            );
            
            if (orderRows.length === 0) {
                return res.status(404).render('error', {
                    error: 'Pedido não encontrado para tracking',
                    layout: false
                });
            }
            
            const order = orderRows[0];
            
            // Parse items
            const items = order.items ? order.items.split(';;').map(item => {
                const [name, quantity, price] = item.split('|');
                return {
                    name,
                    quantity: parseInt(quantity),
                    price: parseFloat(price)
                };
            }) : [];
            
            // Generate tracking timeline
            const timeline = this.generateTrackingTimeline(order);
            
            res.render('pages/order-tracking-dark-nature', {
                currentPage: 'order-tracking',
                title: `Rastreamento ${orderNumber} - Gonzaga Art & Shine`,
                layout: false,
                order: {
                    ...order,
                    items
                },
                timeline
            });
            
        } catch (error) {
            console.error('Show tracking error:', error);
            res.status(500).render('error', {
                error: 'Erro ao carregar rastreamento',
                layout: false
            });
        }
    }
    
    /**
     * Generate tracking timeline based on order status
     */
    static generateTrackingTimeline(order) {
        const timeline = [];
        
        // Order created
        timeline.push({
            status: 'pending',
            title: 'Pedido Recebido',
            description: 'O seu pedido foi recebido e está a ser verificado',
            date: order.created_at,
            completed: true,
            icon: '📝'
        });
        
        // Order confirmed
        if (['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status)) {
            timeline.push({
                status: 'confirmed',
                title: 'Pedido Confirmado',
                description: 'Pagamento confirmado. Preparação iniciada.',
                date: order.updated_at,
                completed: true,
                icon: '✅'
            });
        } else {
            timeline.push({
                status: 'confirmed',
                title: 'Aguarda Confirmação',
                description: 'Verificação de pagamento em curso',
                date: null,
                completed: false,
                icon: '⏳'
            });
        }
        
        // Order processing
        if (['processing', 'shipped', 'delivered'].includes(order.status)) {
            timeline.push({
                status: 'processing',
                title: 'Em Preparação',
                description: 'A sua peça sagrada está a ser preparada pelos nossos artesãos',
                date: order.updated_at,
                completed: true,
                icon: '⚒️'
            });
        } else {
            timeline.push({
                status: 'processing',
                title: 'Aguarda Preparação',
                description: 'Será iniciada após confirmação',
                date: null,
                completed: false,
                icon: '⚒️'
            });
        }
        
        // Order shipped
        if (['shipped', 'delivered'].includes(order.status)) {
            timeline.push({
                status: 'shipped',
                title: 'Enviado',
                description: `Enviado via ${order.shipping_method === 'express' ? 'expresso' : 'standard'}${order.tracking_number ? `. Tracking: ${order.tracking_number}` : ''}`,
                date: order.updated_at,
                completed: true,
                icon: '🚚'
            });
        } else {
            timeline.push({
                status: 'shipped',
                title: 'Aguarda Envio',
                description: 'Será enviado após preparação',
                date: null,
                completed: false,
                icon: '📦'
            });
        }
        
        // Order delivered
        if (order.status === 'delivered') {
            timeline.push({
                status: 'delivered',
                title: 'Entregue',
                description: 'A sua peça sagrada foi entregue com sucesso',
                date: order.updated_at,
                completed: true,
                icon: '🎉'
            });
        } else {
            timeline.push({
                status: 'delivered',
                title: 'Aguarda Entrega',
                description: 'Será entregue após envio',
                date: null,
                completed: false,
                icon: '🏠'
            });
        }
        
        return timeline;
    }
}

module.exports = OrderController;

