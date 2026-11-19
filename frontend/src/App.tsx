import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { BottomNav, TabType } from './components/layout/BottomNav';
import { DateNavigator } from './components/dashboard/DateNavigator';
import { CalorieRing } from './components/dashboard/CalorieRing';
import { MacroCards } from './components/dashboard/MacroCards';
import { MealSection } from './components/dashboard/MealSection';
import { AddMealModal } from './components/modals/AddMealModal';
import { EditItemModal } from './components/modals/EditItemModal';
import { CalendarView } from './components/history/CalendarView';
import { CalorieTrendChart } from './components/reports/CalorieTrendChart';
import { MacroDistributionChart } from './components/reports/MacroDistributionChart';
import { SummaryStats } from './components/reports/SummaryStats';
import { GoalSettingsForm } from './components/profile/GoalSettingsForm';
import { UserProfile } from './components/profile/UserProfile';
import { AuthModal } from './components/auth/AuthModal';
import { useAuth } from './context/AuthContext';
import { api } from './services/api';
import {
  DailySummary,
  MealType,
  MealItemSummary,
  CalorieTrendItem,
  MacroDistributionItem,
  SummaryStats as SummaryStatsType
} from './types';

export const App: React.FC = () => {
  const { user, currentGoal, loading: authLoading, updateGoalLocally } = useAuth();

  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [currentDate, setCurrentDate] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  const [dailyData, setDailyData] = useState<DailySummary | null>(null);
  const [loadingDaily, setLoadingDaily] = useState(false);

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [activeMealType, setActiveMealType] = useState<MealType>('LUNCH');
  const [editingItem, setEditingItem] = useState<MealItemSummary | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Reports data state
  const [trendData, setTrendData] = useState<CalorieTrendItem[]>([]);
  const [macroDistData, setMacroDistData] = useState<MacroDistributionItem[]>([]);
  const [summaryStats, setSummaryStats] = useState<SummaryStatsType | null>(null);
  const [loadingReports, setLoadingReports] = useState(false);

  // Carrega dados da data atual
  const loadDailySummary = async (date: string) => {
    setLoadingDaily(true);
    try {
      const summary = await api.getDaily(date);
      setDailyData(summary);
      if (summary.goal) {
        updateGoalLocally({
          ...summary.goal,
          date: summary.date
        });
      }
    } catch (e) {
      console.error('Erro ao carregar dados do dia:', e);
    } finally {
      setLoadingDaily(false);
    }
  };

  // Carrega relatórios
  const loadReportsData = async () => {
    setLoadingReports(true);
    try {
      const [trend, macros, stats] = await Promise.all([
        api.getTrend(7),
        api.getMacroDistribution(7),
        api.getSummaryStats()
      ]);
      setTrendData(trend);
      setMacroDistData(macros);
      setSummaryStats(stats);
    } catch (e) {
      console.error('Erro ao carregar relatórios:', e);
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      loadDailySummary(currentDate);
    }
  }, [currentDate, authLoading, user]);

  useEffect(() => {
    if (currentTab === 'reports' && !authLoading) {
      loadReportsData();
    }
  }, [currentTab, authLoading, user]);

  // Handler para adicionar refeição específica
  const handleOpenAddForMeal = (type: MealType) => {
    setActiveMealType(type);
    setAddModalOpen(true);
  };

  // Handler para excluir item de refeição
  const handleDeleteItem = async (itemId: string) => {
    try {
      await api.deleteItem(itemId);
      loadDailySummary(currentDate);
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir item.');
    }
  };

  return (
    <div className="min-h-screen bg-black dark:bg-[#09090B] text-zinc-100 flex flex-col pb-28">
      {/* Top Header */}
      <Header onOpenAddModal={() => setAddModalOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 pt-4">
        {/* TAB 1: INÍCIO (DASHBOARD) */}
        {currentTab === 'home' && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-200">
            {/* Seletor Rápido de Data */}
            <DateNavigator
              currentDate={currentDate}
              onDateChange={(d) => setCurrentDate(d)}
            />

            {/* Card Principal: Anel de Progresso de Calorias */}
            <div className="bg-zinc-900/60 dark:bg-[#121216] border border-zinc-800 dark:border-[#27272A] rounded-3xl overflow-hidden shadow-sm">
              <CalorieRing
                goal={dailyData?.goal.calories || 2000}
                consumed={dailyData?.consumed.calories || 0}
                remaining={dailyData?.remaining.calories || 2000}
                percentage={dailyData?.percentages.calories || 0}
              />
            </div>

            {/* Barras de Progresso dos Macronutrientes (Proteínas, Carboidratos, Gorduras) */}
            <MacroCards
              goal={
                dailyData?.goal || {
                  proteins: 150,
                  carbs: 200,
                  fats: 65
                }
              }
              consumed={
                dailyData?.consumed || {
                  proteins: 0,
                  carbs: 0,
                  fats: 0
                }
              }
            />

            {/* Lista das 5 Refeições do Dia */}
            <div className="flex flex-col gap-3 mt-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Refeições do Dia
                </h3>
                <span className="text-xs text-zinc-500 font-mono">
                  {dailyData?.meals.reduce((acc, m) => acc + m.items.length, 0) || 0} itens registrados
                </span>
              </div>

              {dailyData?.meals.map((meal) => (
                <MealSection
                  key={meal.id}
                  meal={meal}
                  onAddItem={handleOpenAddForMeal}
                  onEditItem={(item) => setEditingItem(item)}
                  onDeleteItem={handleDeleteItem}
                />
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: HISTÓRICO */}
        {currentTab === 'history' && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-200">
            <CalendarView />
          </div>
        )}

        {/* TAB 3: RELATÓRIOS */}
        {currentTab === 'reports' && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-200">
            <SummaryStats stats={summaryStats} />
            <CalorieTrendChart data={trendData} />
            <MacroDistributionChart data={macroDistData} />
          </div>
        )}

        {/* TAB 4: PERFIL & METAS */}
        {currentTab === 'profile' && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-200">
            <UserProfile onOpenAuthModal={() => setAuthModalOpen(true)} />
            <GoalSettingsForm
              currentGoal={dailyData?.goal || currentGoal}
              currentDate={currentDate}
              onGoalUpdated={(updated) => {
                updateGoalLocally(updated);
                loadDailySummary(currentDate);
              }}
            />
          </div>
        )}
      </main>

      {/* Barra de Navegação Inferior Fixa Mobile */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(t) => setCurrentTab(t)}
        onOpenAddModal={() => setAddModalOpen(true)}
      />

      {/* Modal Principal de Adicionar Alimento */}
      <AddMealModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        currentDate={currentDate}
        initialMealType={activeMealType}
        onSuccess={() => {
          loadDailySummary(currentDate);
          if (currentTab === 'reports') loadReportsData();
        }}
      />

      {/* Modal de Editar Quantidade de Alimento */}
      <EditItemModal
        isOpen={!!editingItem}
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSuccess={() => {
          loadDailySummary(currentDate);
          if (currentTab === 'reports') loadReportsData();
        }}
      />

      {/* Modal de Autenticação / Login */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
};
