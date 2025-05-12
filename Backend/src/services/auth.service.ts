import User from '@/models/user.model';
import { generateToken } from '@/utils/jwt.utils';
import { AppError } from '@/utils/AppError'; // Sẽ tạo AppError ở dưới

interface RegisterUserInput {
  name: string;
  email: string;
  password?: string; // Thêm dấu ? vì password_confirmation không phải là một phần của UserAttributes
  password_confirmation?: string;
}

export const registerUser = async (input: RegisterUserInput) => {
  const { name, email, password } = input;

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new AppError('Email đã được đăng ký.', 409); // 409 Conflict
  }

  const user = await User.create({ name, email, password });
  // Không trả về mật khẩu đã hash
  const userResponse = { id: user.id, name: user.name, email: user.email };
  return userResponse;
};

export const loginUser = async (input: { email: string; password?: string }) => {
  const { email, password } = input;

  if (!password) {
    throw new AppError('Vui lòng cung cấp mật khẩu.', 400);
  }

  const user = await User.findOne({ where: { email } });
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Email hoặc mật khẩu không chính xác.', 401); // 401 Unauthorized
  }

  const token = generateToken(user.id);
  const userResponse = { id: user.id, name: user.name, email: user.email };

  return { token, user: userResponse };
};