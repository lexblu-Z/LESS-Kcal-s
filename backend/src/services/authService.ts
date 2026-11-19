import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { ENV } from '../config/env.js';
import { getTodayDateString } from '../utils/dateUtils.js';

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export class AuthService {
  async register(data: RegisterDTO) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() }
    });

    if (existingUser) {
      throw new Error('E-mail já cadastrado no sistema.');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        password: hashedPassword
      }
    });

    // Cria meta inicial padrão para hoje
    const today = getTodayDateString();
    await prisma.dailyGoal.create({
      data: {
        userId: user.id,
        date: today,
        calories: 2000,
        proteins: 150,
        carbs: 200,
        fats: 65,
        waterMl: 2500
      }
    });

    const token = this.generateToken(user.id, user.email, user.name);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    };
  }

  async login(data: LoginDTO) {
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() }
    });

    if (!user) {
      throw new Error('Credenciais inválidas. Verifique seu e-mail e senha.');
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      throw new Error('Credenciais inválidas. Verifique seu e-mail e senha.');
    }

    const token = this.generateToken(user.id, user.email, user.name);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    };
  }

  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new Error('Usuário não encontrado.');
    }

    const today = getTodayDateString();
    let goal = await prisma.dailyGoal.findUnique({
      where: {
        userId_date: {
          userId,
          date: today
        }
      }
    });

    // Se ainda não tiver meta para hoje, busca a meta mais recente
    if (!goal) {
      goal = await prisma.dailyGoal.findFirst({
        where: { userId },
        orderBy: { date: 'desc' }
      });
    }

    return {
      user,
      currentGoal: goal || {
        calories: 2000,
        proteins: 150,
        carbs: 200,
        fats: 65,
        waterMl: 2000
      }
    };
  }

  private generateToken(userId: string, email: string, name: string): string {
    return jwt.sign(
      { userId, email, name },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }
}

export const authService = new AuthService();
