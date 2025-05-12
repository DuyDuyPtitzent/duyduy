import dotenv from 'dotenv';
import path from 'path';

// Xác định tệp .env dựa trên NODE_ENV
// Nếu process.env.NODE_ENV chưa được định nghĩa ở đây (ví dụ, chưa được set từ bên ngoài hoặc từ tệp .env khác đã load trước đó),
// thì envFile sẽ mặc định là '.env'.
const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env';

// Tải biến môi trường từ tệp .env (ví dụ: .env.development hoặc .env)
// Đường dẫn được giải quyết tương đối với thư mục chứa tệp env.ts này (src/config/)
// đi lên 2 cấp (../../) để ra thư mục Backend/ rồi tìm envFile
const primaryEnvPath = path.resolve(__dirname, '..', '..', envFile);
const primaryResult = dotenv.config({ path: primaryEnvPath });

// Nếu PORT chưa được đặt (có thể do tệp .env theo NODE_ENV không có hoặc không được tải)
// và không phải môi trường test, thử tải lại từ tệp .env gốc (nếu envFile không phải là '.env')
// Hoặc nếu lần tải đầu tiên thất bại và envFile là '.env', chúng ta không cần làm gì thêm ở đây vì đã thử tải nó rồi.
if ((!process.env.PORT && process.env.NODE_ENV !== 'test' && envFile !== '.env') || primaryResult.error) {
  const fallbackEnvPath = path.resolve(__dirname, '..', '..', '.env');
  console.log(`DEBUG: Primary load for '${envFile}' might have issues or PORT is missing. Attempting fallback to '.env' at ${fallbackEnvPath}`);
  dotenv.config({ path: fallbackEnvPath }); // Ghi đè nếu cần thiết
}

// --- Thêm các dòng console.log này để DEBUG ---
console.log('DEBUG: process.cwd():', process.cwd());
console.log('DEBUG: __dirname:', __dirname);
console.log('DEBUG: Attempted primary envFile:', envFile);
console.log('DEBUG: Resolved path for primary envFile:', primaryEnvPath);
if (primaryResult.error) {
  console.error('DEBUG: Error loading primary env file:', primaryResult.error);
} else {
  console.log('DEBUG: Successfully parsed primary env file:', primaryResult.parsed);
}

console.log('DEBUG: NODE_ENV at config population:', process.env.NODE_ENV);
console.log('DEBUG: DB_USER from process.env:', process.env.DB_USER);
console.log('DEBUG: DB_PASSWORD from process.env:', process.env.DB_PASSWORD);
console.log('DEBUG: DB_NAME from process.env:', process.env.DB_NAME);
console.log('DEBUG: PORT from process.env:', process.env.PORT);
// --- Kết thúc DEBUG ---

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER, // Sẽ được kiểm tra ở dưới
    password: process.env.DB_PASSWORD, // Sẽ được kiểm tra ở dưới
    name: process.env.DB_NAME, // Sẽ được kiểm tra ở dưới
    dialect: process.env.DB_DIALECT || 'mysql',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'defaultSecretKey', // Đảm bảo có giá trị mặc định an toàn hơn nếu JWT_SECRET không được đặt
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? (process.env.CORS_ORIGIN || 'YOUR_PRODUCTION_FRONTEND_URL') // << NHỚ THAY THẾ URL FRONTEND CHO MÔI TRƯỜNG PRODUCTION
      : ['http://localhost:8000', 'http://127.0.0.1:8000'], // Port UmiJS mặc định cho development
  }
};

// Basic validation for critical env variables
// Đảm bảo rằng config.db.user, config.db.password, và config.db.name thực sự có giá trị sau khi tải .env
// Lưu ý: typeof config.db.password === 'undefined' là để cho phép mật khẩu rỗng ""
if (!config.db.user || typeof config.db.password === 'undefined' || !config.db.name) {
  console.error('LỖI CẤU HÌNH: Vui lòng cung cấp đầy đủ thông tin DB_USER, DB_PASSWORD (có thể để trống nếu không có mật khẩu), và DB_NAME trong tệp .env của bạn.');
  console.error(`DEBUG: Values at validation - DB_USER: ${config.db.user}, DB_PASSWORD_TYPE: ${typeof config.db.password}, DB_NAME: ${config.db.name}`);
  if (config.nodeEnv !== 'test') {
    process.exit(1);
  }
}

// Kiểm tra JWT_SECRET
if (!config.jwt.secret || config.jwt.secret === 'YOUR_VERY_STRONG_AND_UNIQUE_JWT_SECRET_KEY_HERE_CHANGE_IT_NOW' || config.jwt.secret === 'defaultSecretKey') {
  console.error('LỖI CẤU HÌNH: Vui lòng đặt một JWT_SECRET mạnh và duy nhất trong tệp .env. Không sử dụng giá trị mặc định hoặc giá trị giữ chỗ.');
  if (config.nodeEnv !== 'test') {
    process.exit(1);
  }
}