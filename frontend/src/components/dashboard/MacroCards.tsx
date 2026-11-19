import React from 'react';
import { MacroBar } from './MacroBar';

interface MacroCardsProps {
  goal: {
    proteins: number;
    carbs: number;
    fats: number;
  };
  consumed: {
    proteins: number;
    carbs: number;
    fats: number;
  };
}

export const MacroCards: React.FC<MacroCardsProps> = ({ goal, consumed }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full">
      <MacroBar
        label="Proteínas"
        consumed={consumed.proteins}
        goal={goal.proteins}
        color="protein"
      />
      <MacroBar
        label="Carboidratos"
        consumed={consumed.carbs}
        goal={goal.carbs}
        color="carbs"
      />
      <MacroBar
        label="Gorduras"
        consumed={consumed.fats}
        goal={goal.fats}
        color="fats"
      />
    </div>
  );
};
