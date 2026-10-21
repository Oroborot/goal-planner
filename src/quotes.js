// Quotes for the cover screen. A small starter list for now; the real
// collection is gathered later (check wording and author before adding).
export const QUOTES = [
  { text: 'Do what you need to do to become what you want to be.', author: '' },
  { text: 'While we wait for life, life passes.', author: 'Seneca' },
  { text: 'Well begun is half done.', author: 'Aristotle' },
  { text: 'It does not matter how slowly you go as long as you do not stop.', author: 'Confucius' },
  { text: 'The happiness of your life depends upon the quality of your thoughts.', author: 'Marcus Aurelius' },
]

// Shown instead with the Stoic theme. Common English translations; the
// source is noted for each so the wording can be checked.
export const STOIC_QUOTES = [
  // Epictetus, Discourses 3.23
  { text: 'First say to yourself what you would be; and then do what you have to do.', author: 'Epictetus' },
  // Marcus Aurelius, Meditations 5.20
  { text: 'The impediment to action advances action. What stands in the way becomes the way.', author: 'Marcus Aurelius' },
  // Seneca, On the Shortness of Life 1
  { text: 'It is not that we have a short time to live, but that we waste a lot of it.', author: 'Seneca' },
  // Marcus Aurelius, Meditations 10.16
  { text: 'Waste no more time arguing about what a good man should be. Be one.', author: 'Marcus Aurelius' },
  // Seneca, Letters to Lucilius 13
  { text: 'We suffer more often in imagination than in reality.', author: 'Seneca' },
  // Seneca, Letters to Lucilius 1
  { text: 'Hold every hour in your grasp.', author: 'Seneca' },
  // Marcus Aurelius, Meditations 12.17
  { text: 'If it is not right, do not do it; if it is not true, do not say it.', author: 'Marcus Aurelius' },
  // The old Stoic reminder
  { text: 'Memento mori. Remember you will die, so use today.', author: '' },
]

// Today's quote: a different one each day, the same all day long.
// `offset` moves to the next ones (tap the quote). The Stoic theme uses
// its own list.
export function quoteFor(dateKey, offset = 0, themeId = '') {
  const list = themeId === 'stoic' ? STOIC_QUOTES : QUOTES
  const day = Math.floor(new Date(`${dateKey}T12:00:00`).getTime() / 86400000)
  return list[(day + offset) % list.length]
}
