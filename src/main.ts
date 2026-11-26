// @ts-ignore SCSS is loaded by the bundler and has no TypeScript declarations.
import './styles/main.scss';
import { createPinholeDialog } from './ui/pinhole-dialog';
import { createCalculator } from './ui/calculator';
import { createLanguagePicker } from './ui/language';
import { createFormulaDialog } from './formula/dialog';
import { version } from '../package.json';

document.querySelector('#app-version')!.textContent = `v${version}`;

const formula = createFormulaDialog();
const language = createLanguagePicker(() => {
  calculator.update();
  pinholeDialog.update();
});
const calculator = createCalculator(language.getLanguage, (settings) => {
  void formula.render(language.getLanguage(), settings);
});
const pinholeDialog = createPinholeDialog(language.getLanguage);
language.start();
