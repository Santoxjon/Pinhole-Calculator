export const PAPER_ISO = 6;

export const METER_APERTURE_MIN = 1;
export const METER_APERTURE_MAX = 32;

export function isMeterApertureValid(value: number): boolean {
  return (
    Number.isFinite(value) &&
    value >= METER_APERTURE_MIN &&
    value <= METER_APERTURE_MAX
  );
}

export interface ExposureSettings {
  pinhole: number;
  iso: number;
  aperture: number;
  shutter: number;
}

export function calculateExposure(settings: ExposureSettings): number {
  if (
    Object.values(settings).some(
      (value) => !Number.isFinite(value) || value <= 0,
    )
  ) {
    throw new RangeError('Enter a positive number for every setting.');
  }
  const seconds =
    settings.shutter *
    (settings.pinhole / settings.aperture) ** 2 *
    (settings.iso / PAPER_ISO);
  if (!Number.isFinite(seconds) || seconds <= 0)
    throw new RangeError('These settings exceed the calculation range.');
  return seconds;
}

export function formatExposure(
  seconds: number,
  units = { second: 'sec', minute: 'min', hour: 'hr', locale: 'en' },
): string {
  const number = (value: number) =>
    new Intl.NumberFormat(units.locale, { maximumSignificantDigits: 3 }).format(
      value,
    );
  if (seconds < 1) return `${number(seconds)} ${units.second}`;
  const rounded = Math.round(seconds);
  if (rounded < 60) return `${rounded} ${units.second}`;
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  return [
    hours && `${hours} ${units.hour}`,
    minutes && `${minutes} ${units.minute}`,
    rounded % 60 && `${rounded % 60} ${units.second}`,
  ]
    .filter(Boolean)
    .join(' ');
}
