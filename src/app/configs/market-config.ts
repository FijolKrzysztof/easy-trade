export const MARKET_OPEN_HOUR = 9;
export const MARKET_OPEN_MINUTE = 30;
export const MARKET_CLOSE_HOUR = 16;
export const MARKET_CLOSE_MINUTE = 0;

export const TRADING_DAYS = [1, 2, 3, 4, 5];

// export const BASE_VOLATILITY = 0.004;
// export const MOMENTUM_FACTOR = 0.002;
// export const SPIKE_PROBABILITY = 0.1;
// export const SPIKE_MAGNITUDE = 0.005;

// Bazowa zmienność - typowa dzienna zmienność na rynku to około 1-2%
// Przy 78 5-minutowych interwałach w ciągu dnia handlowego (6.5h),
// ustawiamy BASE_VOLATILITY na około 0.001-0.002 dla pojedynczego interwału
export const BASE_VOLATILITY = 0.0015;

// MOMENTUM_FACTOR powinien być mniejszy niż BASE_VOLATILITY,
// ale wystarczająco duży by tworzyć zauważalne trendy
export const MOMENTUM_FACTOR = 0.0008;

// Spikes (nagłe zmiany) powinny być rzadkie ale znaczące
// 0.05 oznacza średnio 3-4 spiki dziennie per akcja
export const SPIKE_PROBABILITY = 0.05;

// Magnitude powinna być około 3-4x większa niż BASE_VOLATILITY
// by stworzyć zauważalne ale nie absurdalne ruchy
export const SPIKE_MAGNITUDE = 0.005;
