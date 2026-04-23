import GasStationIcon from '@icons/monthEntry/GasStation.astro'
import OtherIcon from '@icons/Others.astro';
import JobIcon from '@icons/income/Job.astro';
import FoodIcon from '@icons/dailyEntry/Food.astro';
import TradeIcon from '@icons/dailyEntry/Trade.astro';
import TransportIcon from '@icons/dailyEntry/Transport.astro';
import DailyExpenseIcon from '@icons/index/DailyExpense.astro';
import ExpenseIcon from '@icons/index/Expense.astro';
import IncomeIcon from '@icons/index/Income.astro';

export const ICON_LIST = [
  { name: 'Others', component: OtherIcon },
  { name: 'Job', component: JobIcon },
  { name: 'GasStation', component: GasStationIcon },
  { name: 'Food', component: FoodIcon },
  { name: 'Trade', component: TradeIcon },
  { name: 'Transport', component: TransportIcon },
  { name: 'DailyExpense', component: DailyExpenseIcon },
  { name: 'Expense', component: ExpenseIcon },
  { name: 'Income', component: IncomeIcon },
];