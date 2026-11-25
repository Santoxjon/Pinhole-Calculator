import {
  calculateExposure,
  PAPER_ISO,
  isMeterApertureValid,
  type ExposureSettings,
} from '../domain/exposure.ts';
import type { Language } from '../i18n/types.ts';

export interface FormulaContent {
  label: string;
  tex: string;
  mathml: string;
}

export const GENERAL_MATHML = `<mi>t</mi><mo>=</mo><msub><mi>t</mi><mi>m</mi></msub><mo>×</mo><msup><mrow><mo>(</mo><mfrac><msub><mi>f</mi><mi>e</mi></msub><msub><mi>f</mi><mi>m</mi></msub></mfrac><mo>)</mo></mrow><mn>2</mn></msup><mo>×</mo><mfrac><msub><mi mathvariant="normal">ISO</mi><mi>m</mi></msub><mn>${PAPER_ISO}</mn></mfrac>`;
export const GENERAL_TEX = String.raw`t = t_m \times \left(\frac{f_e}{f_m}\right)^2 \times \frac{\mathrm{ISO}_m}{${PAPER_ISO}}`;

export function buildExample(
  language: Language,
  settings: ExposureSettings,
): FormulaContent {
  const formatter = new Intl.NumberFormat(language, {
    maximumSignificantDigits: 6,
    useGrouping: false,
  });
  const number = (value: number) => formatter.format(value);
  const texNumber = (value: number) => number(value).replace(',', '{,}');
  const seconds = calculateExposure(settings);
  if (!isMeterApertureValid(settings.aperture))
    throw new RangeError('Invalid meter aperture');
  const { pinhole, aperture, iso, shutter } = settings;
  const denominator = Math.round(1 / shutter);
  const fractional = shutter < 1 && Math.abs(shutter * denominator - 1) < 1e-10;
  const shutterText = fractional ? `1/${denominator}` : number(shutter);
  const shutterTex = fractional
    ? String.raw`\frac{1}{${denominator}}`
    : texNumber(shutter);
  const ratioSquared = (pinhole / aperture) ** 2;
  const isoRatio = iso / PAPER_ISO;
  const rounded =
    seconds >= 1 ? Math.round(seconds) : Number(seconds.toPrecision(3));
  const result = `${number(seconds)} s${rounded !== seconds ? ` ≈ ${number(rounded)} s` : ''}`;
  const label = `t = ${shutterText} × (${number(pinhole)} ÷ ${number(aperture)})² × (${number(iso)} ÷ ${PAPER_ISO})\nt ≈ ${number(shutter)} × ${number(ratioSquared)} × ${number(isoRatio)}\nt ≈ ${result}`;
  // Intermediate values are display-rounded; calculate the result from full precision.
  const tex = String.raw`\begin{gathered}t = ${shutterTex} \times \left(\frac{${texNumber(pinhole)}}{${texNumber(aperture)}}\right)^2 \times \frac{${texNumber(iso)}}{${PAPER_ISO}} \\[.6em] t \approx ${texNumber(shutter)} \times ${texNumber(ratioSquared)} \times ${texNumber(isoRatio)} \\[.6em] \boldsymbol{t \approx ${texNumber(seconds)}\,\mathrm{s}${rounded !== seconds ? String.raw` \approx ${texNumber(rounded)}\,\mathrm{s}` : ''}}\end{gathered}`;
  const mn = (value: number) => `<mn>${number(value)}</mn>`;
  const fraction = (top: string, bottom: string) =>
    `<mfrac>${top}${bottom}</mfrac>`;
  const times = '<mo>×</mo>';
  const row = (content: string, approximate = false, result = false) => {
    const line = `<mi>t</mi><mo>${approximate ? '≈' : '='}</mo>${content}`;
    const styled = result
      ? line
          .replace('<mi>t</mi>', '<mi mathvariant="bold-italic">t</mi>')
          .replaceAll('<mn>', '<mn mathvariant="bold">')
          .replaceAll('<mo>', '<mo mathvariant="bold">')
          .replaceAll('mathvariant="normal"', 'mathvariant="bold"')
      : line;
    return `<mtr><mtd>${styled}</mtd></mtr>`;
  };
  const firstLine =
    (fractional ? fraction(mn(1), mn(denominator)) : mn(shutter)) +
    times +
    `<msup><mrow><mo>(</mo>${fraction(mn(pinhole), mn(aperture))}<mo>)</mo></mrow><mn>2</mn></msup>` +
    times +
    fraction(mn(iso), mn(PAPER_ISO));
  const secondLine =
    mn(shutter) + times + mn(ratioSquared) + times + mn(isoRatio);
  const lastLine =
    mn(seconds) +
    '<mi mathvariant="normal">s</mi>' +
    (rounded !== seconds
      ? '<mo>≈</mo>' + mn(rounded) + '<mi mathvariant="normal">s</mi>'
      : '');
  const mathml = `<mtable columnalign="center" rowspacing="0.6em">${row(firstLine)}${row(secondLine, true)}${row(lastLine, true, true)}</mtable>`;
  return { label, tex, mathml };
}
