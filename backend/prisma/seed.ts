import { PrismaClient } from '../src/generated/prisma-client/index.js';
import bcrypt from 'bcryptjs';
import { TACO_TBCA_FOODS } from '../src/data/tacoTbcaFoods.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados LESS-Kcal-s...');

  // 1. Criar usuário de demonstração padrão
  const demoEmail = 'demo@lesskcals.com';
  let demoUser = await prisma.user.findUnique({
    where: { email: demoEmail }
  });

  if (!demoUser) {
    const hashedPassword = await bcrypt.hash('demo123456', 10);
    demoUser = await prisma.user.create({
      data: {
        email: demoEmail,
        password: hashedPassword,
        name: 'Leonardo Souza'
      }
    });
    console.log(`✅ Usuário demo criado: ${demoUser.email} (senha: demo123456)`);
  } else {
    console.log(`ℹ️ Usuário demo já existente: ${demoUser.email}`);
  }

  // 2. Criar metas diárias para demonstração (Hoje e Ontem para validar versionamento)
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  await prisma.dailyGoal.upsert({
    where: {
      userId_date: {
        userId: demoUser.id,
        date: todayStr
      }
    },
    update: {},
    create: {
      userId: demoUser.id,
      date: todayStr,
      calories: 2000,
      proteins: 150,
      carbs: 200,
      fats: 65,
      waterMl: 2500
    }
  });

  await prisma.dailyGoal.upsert({
    where: {
      userId_date: {
        userId: demoUser.id,
        date: yesterdayStr
      }
    },
    update: {},
    create: {
      userId: demoUser.id,
      date: yesterdayStr,
      calories: 1900,
      proteins: 140,
      carbs: 190,
      fats: 60,
      waterMl: 2000
    }
  });
  console.log(`✅ Metas diárias configuradas para ${todayStr} e ${yesterdayStr}`);

  // 3. Popular alimentos da base TACO / TBCA
  console.log(`🥗 Populando ${TACO_TBCA_FOODS.length} alimentos da tabela TACO/TBCA...`);
  let count = 0;

  for (const food of TACO_TBCA_FOODS) {
    // Usamos findFirst por nome e isCustom: false para evitar duplicatas
    const existing = await prisma.food.findFirst({
      where: {
        name: food.name,
        isCustom: false
      }
    });

    if (!existing) {
      await prisma.food.create({
        data: {
          name: food.name,
          category: food.category,
          source: food.source,
          baseUnit: food.baseUnit,
          baseQuantity: food.baseQuantity,
          calories: food.calories,
          proteins: food.proteins,
          carbs: food.carbs,
          fats: food.fats,
          fibers: food.fibers,
          servingSize: food.servingSize,
          servingUnit: food.servingUnit,
          isCustom: false
        }
      });
      count++;
    }
  }

  console.log(`✨ Seed concluído com sucesso! ${count} novos alimentos cadastrados na base.`);
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
