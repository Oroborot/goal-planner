// Quotes for the cover screen. A small starter list for now; the real
// collection is gathered later (check wording and author before adding).
export const QUOTES = [
  { text: 'Do what you need to do to become what you want to be.', author: '' },
  { text: 'While we wait for life, life passes.', author: 'Seneca' },
  { text: 'Well begun is half done.', author: 'Aristotle' },
  { text: 'It does not matter how slowly you go as long as you do not stop.', author: 'Confucius' },
  { text: 'The happiness of your life depends upon the quality of your thoughts.', author: 'Marcus Aurelius' },
]

// Today's quote: a different one each day, the same all day long.
// `offset` moves to the next ones (tap the quote).
export function quoteFor(dateKey, offset = 0) {
  const day = Math.floor(new Date(`${dateKey}T12:00:00`).getTime() / 86400000)
  return QUOTES[(day + offset) % QUOTES.length]
}
