import prisma from '../config/database.js';

export const getDashboardStats = async (req, res) => {
  try {
    const organizationId = req.organizationId;
    
    const settings = await prisma.setting.findUnique({
      where: { organizationId }
    });
    
    const defaultThreshold = settings?.defaultLowStockThreshold || 5;
    
    const products = await prisma.product.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        sku: true,
        quantityOnHand: true,
        lowStockThreshold: true
      }
    });
    
    const totalProducts = products.length;
    const totalQuantity = products.reduce((sum, p) => sum + p.quantityOnHand, 0);
    
    const lowStockItems = products.filter(product => {
      const threshold = product.lowStockThreshold || defaultThreshold;
      return product.quantityOnHand <= threshold;
    });
    
    res.json({
      stats: {
        totalProducts,
        totalQuantity,
        lowStockCount: lowStockItems.length
      },
      lowStockItems: lowStockItems.map(item => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        quantityOnHand: item.quantityOnHand,
        lowStockThreshold: item.lowStockThreshold || defaultThreshold
      }))
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};