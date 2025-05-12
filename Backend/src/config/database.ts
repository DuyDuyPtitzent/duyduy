import { Sequelize, Dialect } from 'sequelize';
import { config } from './env';

const sequelize = new Sequelize(
  config.db.name!, // Thêm ! vì đã kiểm tra ở env.ts
  config.db.user!,
  config.db.password,
  {
    host: config.db.host,
    port: config.db.port,
    dialect: config.db.dialect as Dialect,
    logging: config.nodeEnv === 'development' ? console.log : false,
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
  },
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`INFO: Kết nối cơ sở dữ liệu '${config.db.name}' thành công.`);
    if (config.nodeEnv === 'development') {
      // CHỈ DÙNG sync TRONG DEVELOPMENT. PRODUCTION NÊN DÙNG MIGRATIONS.
      await sequelize.sync({ alter: true }); // alter: true cố gắng cập nhật bảng, ít rủi ro hơn force: true
      console.log('INFO: Đồng bộ hóa models với DB thành công (dev mode - alter:true).');
    }
  } catch (error) {
    console.error('LỖI: Không thể kết nối tới cơ sở dữ liệu:', error);
    process.exit(1);
  }
};

export default sequelize;