import prisma from '../config/database.js';

export const getProducts = async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    const organizationId = req.organizationId;
    
    const settings = await prisma.setting.findUnique({
      where: { organizationId }
    });
    const defaultThreshold = settings?.defaultLowStockThreshold || 5;
    
    const where = {
      organizationId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } }
        ]
      })
    };
    
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit)
      }),
      prisma.product.count({ where })
    ]);
    
    const productsWithIndicator = products.map(product => {
      const threshold = product.lowStockThreshold || defaultThreshold;
      const isLowStock = product.quantityOnHand <= threshold;
      return {
        ...product,
        lowStockIndicator: isLowStock,
        lowStockStatus: isLowStock ? 'Low Stock' : 'In Stock'
      };
    });
    
    res.json({
      products: productsWithIndicator,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.organizationId;
    
    const product = await prisma.product.findFirst({
      where: {
        id,
        organizationId
      }
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

export const createProduct = async (req, res) => {
  try {
    const organizationId = req.organizationId;
    const { name, sku, description, quantityOnHand, costPrice, sellingPrice, lowStockThreshold } = req.body;
    
    const existingProduct = await prisma.product.findFirst({
      where: {
        organizationId,
        sku
      }
    });
    
    if (existingProduct) {
      return res.status(400).json({ error: 'SKU already exists in your organization' });
    }
    
    const product = await prisma.product.create({
      data: {
        organizationId,
        name,
        sku,
        description,
        quantityOnHand: quantityOnHand || 0,
        costPrice,
        sellingPrice,
        lowStockThreshold
      }
    });
    
    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.organizationId;
    const { name, sku, description, quantityOnHand, costPrice, sellingPrice, lowStockThreshold } = req.body;
    
    const existingProduct = await prisma.product.findFirst({
      where: { id, organizationId }
    });
    
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Check SKU uniqueness if changing SKU
    if (sku !== existingProduct.sku) {
      const skuExists = await prisma.product.findFirst({
        where: { 
          organizationId, 
          sku, 
          id: { not: id } 
        }
      });
      
      if (skuExists) {
        return res.status(400).json({ error: 'SKU already exists in your organization' });
      }
    }
    
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        sku,
        description,
        quantityOnHand: quantityOnHand !== undefined ? quantityOnHand : existingProduct.quantityOnHand,
        costPrice: costPrice !== undefined ? costPrice : existingProduct.costPrice,
        sellingPrice: sellingPrice !== undefined ? sellingPrice : existingProduct.sellingPrice,
        lowStockThreshold: lowStockThreshold !== undefined ? lowStockThreshold : existingProduct.lowStockThreshold,
      }
    });
    
    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const adjustStock = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.organizationId;
    const { adjustment, note } = req.body;
    
    const product = await prisma.product.findFirst({
      where: {
        id,
        organizationId
      }
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const newQuantity = product.quantityOnHand + adjustment;
    if (newQuantity < 0) {
      return res.status(400).json({ error: 'Cannot reduce stock below 0' });
    }
    
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        quantityOnHand: newQuantity
      }
    });
    
    res.json({
      message: `Stock adjusted by ${adjustment} units`,
      product: updatedProduct,
      adjustment,
      note
    });
  } catch (error) {
    console.error('Adjust stock error:', error);
    res.status(500).json({ error: 'Failed to adjust stock' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.organizationId;
    
    const product = await prisma.product.findFirst({
      where: {
        id,
        organizationId
      }
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    await prisma.product.delete({
      where: { id }
    });
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};