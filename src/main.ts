// @ts-ignore SCSS is loaded by the bundler and has no TypeScript declarations.
import './styles/main.scss';
import { createCalculator } from './ui/calculator';
import { createLanguagePicker } from './ui/language';
import { createFormulaDialog } from './formula/dialog';

const formula = createFormulaDialog();
const language = createLanguagePicker(() => calculator.update());
const calculator = createCalculator(language.getLanguage, (settings) => {
  void formula.render(language.getLanguage(), settings);
});
language.start();
