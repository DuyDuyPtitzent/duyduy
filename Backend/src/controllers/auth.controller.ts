import { Request, Response, NextFunction } from 'express';
import * as authService from '@/services/auth.service';

// Helper để bắt lỗi async
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, password_confirmation } = req.body;

  if (!name || !email || !password || !password_confirmation) {
    return res.status(400).json({ status: 'fail', message: 'Vui lòng cung cấp đầy đủ thông tin: name, email, password, password_confirmation.' });
  }

  if (password !== password_confirmation) {
    return res.status(400).json({ status: 'fail', message: 'Mật khẩu và xác nhận mật khẩu không khớp.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ status: 'fail', message: 'Mật khẩu phải có ít nhất 6 ký tự.' });
  }

  const user = await authService.registerUser({ name, email, password });
  res.status(201).json({
    status: 'success',
    message: 'Đăng ký thành công!',
    data: { user },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ status: 'fail', message: 'Vui lòng cung cấp email và mật khẩu.' });
  }

  const result = await authService.loginUser({ email, password });
  res.status(200).json({
    status: 'success',
    message: 'Đăng nhập thành công!',
    data: result,
  });
});