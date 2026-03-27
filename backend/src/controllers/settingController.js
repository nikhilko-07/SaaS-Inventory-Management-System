import prisma from '../config/database.js';

export const getSettings = async (req, res) => {
  try {
    const organizationId = req.organizationId;
    
    let settings = await prisma.setting.findUnique({
      where: { organizationId }
    });
    
    if (!settings) {
      settings = await prisma.setting.create({
        data: {
          organizationId,
          defaultLowStockThreshold: parseInt(process.env.DEFAULT_LOW_STOCK_THRESHOLD) || 5
        }
      });
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const organizationId = req.organizationId;
    const { defaultLowStockThreshold } = req.body;
    
    const settings = await prisma.setting.upsert({
      where: { organizationId },
      update: { defaultLowStockThreshold },
      create: {
        organizationId,
        defaultLowStockThreshold
      }
    });
    
    res.json(settings);
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};