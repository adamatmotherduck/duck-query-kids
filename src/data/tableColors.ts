export interface CanvasColors { header: string; border: string; check: string }
export interface PaletteColors { bg: string; border: string; text: string; dot: string }

const FALLBACK_CANVAS: CanvasColors = { header: 'bg-gray-500', border: 'border-gray-400', check: 'accent-gray-500' };
const FALLBACK_PALETTE: PaletteColors = { bg: 'bg-gray-50', border: 'border-gray-300', text: 'text-gray-800', dot: 'bg-gray-400' };

const TABLE_COLORS: Record<string, { canvas: CanvasColors; palette: PaletteColors }> = {
  // Northwind
  customers:    { canvas: { header: 'bg-blue-500',    border: 'border-blue-400',    check: 'accent-blue-500'    }, palette: { bg: 'bg-blue-50',    border: 'border-blue-300',    text: 'text-blue-800',    dot: 'bg-blue-400'    } },
  orders:       { canvas: { header: 'bg-green-500',   border: 'border-green-400',   check: 'accent-green-500'   }, palette: { bg: 'bg-green-50',   border: 'border-green-300',   text: 'text-green-800',   dot: 'bg-green-400'   } },
  order_details:{ canvas: { header: 'bg-orange-500',  border: 'border-orange-400',  check: 'accent-orange-500'  }, palette: { bg: 'bg-orange-50',  border: 'border-orange-300',  text: 'text-orange-800',  dot: 'bg-orange-400'  } },
  products:     { canvas: { header: 'bg-purple-500',  border: 'border-purple-400',  check: 'accent-purple-500'  }, palette: { bg: 'bg-purple-50',  border: 'border-purple-300',  text: 'text-purple-800',  dot: 'bg-purple-400'  } },
  categories:   { canvas: { header: 'bg-pink-500',    border: 'border-pink-400',    check: 'accent-pink-500'    }, palette: { bg: 'bg-pink-50',    border: 'border-pink-300',    text: 'text-pink-800',    dot: 'bg-pink-400'    } },
  employees:    { canvas: { header: 'bg-teal-500',    border: 'border-teal-400',    check: 'accent-teal-500'    }, palette: { bg: 'bg-teal-50',    border: 'border-teal-300',    text: 'text-teal-800',    dot: 'bg-teal-400'    } },
  // Chinook
  artist:       { canvas: { header: 'bg-sky-500',     border: 'border-sky-400',     check: 'accent-sky-500'     }, palette: { bg: 'bg-sky-50',     border: 'border-sky-300',     text: 'text-sky-800',     dot: 'bg-sky-400'     } },
  album:        { canvas: { header: 'bg-violet-500',  border: 'border-violet-400',  check: 'accent-violet-500'  }, palette: { bg: 'bg-violet-50',  border: 'border-violet-300',  text: 'text-violet-800',  dot: 'bg-violet-400'  } },
  track:        { canvas: { header: 'bg-emerald-500', border: 'border-emerald-400', check: 'accent-emerald-500' }, palette: { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-800', dot: 'bg-emerald-400' } },
  genre:        { canvas: { header: 'bg-orange-500',  border: 'border-orange-400',  check: 'accent-orange-500'  }, palette: { bg: 'bg-orange-50',  border: 'border-orange-300',  text: 'text-orange-800',  dot: 'bg-orange-400'  } },
  customer:     { canvas: { header: 'bg-blue-500',    border: 'border-blue-400',    check: 'accent-blue-500'    }, palette: { bg: 'bg-blue-50',    border: 'border-blue-300',    text: 'text-blue-800',    dot: 'bg-blue-400'    } },
  invoice:      { canvas: { header: 'bg-green-500',   border: 'border-green-400',   check: 'accent-green-500'   }, palette: { bg: 'bg-green-50',   border: 'border-green-300',   text: 'text-green-800',   dot: 'bg-green-400'   } },
  invoice_line: { canvas: { header: 'bg-amber-500',   border: 'border-amber-400',   check: 'accent-amber-500'   }, palette: { bg: 'bg-amber-50',   border: 'border-amber-300',   text: 'text-amber-800',   dot: 'bg-amber-400'   } },
  employee:     { canvas: { header: 'bg-teal-500',    border: 'border-teal-400',    check: 'accent-teal-500'    }, palette: { bg: 'bg-teal-50',    border: 'border-teal-300',    text: 'text-teal-800',    dot: 'bg-teal-400'    } },
  // IMDB
  movies:       { canvas: { header: 'bg-rose-500',    border: 'border-rose-400',    check: 'accent-rose-500'    }, palette: { bg: 'bg-rose-50',    border: 'border-rose-300',    text: 'text-rose-800',    dot: 'bg-rose-400'    } },
  genres:       { canvas: { header: 'bg-yellow-500',  border: 'border-yellow-400',  check: 'accent-yellow-500'  }, palette: { bg: 'bg-yellow-50',  border: 'border-yellow-300',  text: 'text-yellow-800',  dot: 'bg-yellow-400'  } },
  movie_genres: { canvas: { header: 'bg-lime-600',    border: 'border-lime-500',    check: 'accent-lime-600'    }, palette: { bg: 'bg-lime-50',    border: 'border-lime-300',    text: 'text-lime-800',    dot: 'bg-lime-500'    } },
  people:       { canvas: { header: 'bg-cyan-500',    border: 'border-cyan-400',    check: 'accent-cyan-500'    }, palette: { bg: 'bg-cyan-50',    border: 'border-cyan-300',    text: 'text-cyan-800',    dot: 'bg-cyan-400'    } },
  directors:    { canvas: { header: 'bg-fuchsia-500', border: 'border-fuchsia-400', check: 'accent-fuchsia-500' }, palette: { bg: 'bg-fuchsia-50', border: 'border-fuchsia-300', text: 'text-fuchsia-800', dot: 'bg-fuchsia-400' } },
};

export function getCanvasColors(tableName: string): CanvasColors {
  return TABLE_COLORS[tableName]?.canvas ?? FALLBACK_CANVAS;
}

export function getPaletteColors(tableName: string): PaletteColors {
  return TABLE_COLORS[tableName]?.palette ?? FALLBACK_PALETTE;
}
