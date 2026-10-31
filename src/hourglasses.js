// The hourglass designs you can pick from. Every design uses the same timer
// and the same sand rules (hourglassSand.js); a design only decides how
// things look and where the numbers go.
//
// To add a design later (e.g. a themed one with scenery):
//   1. Make a component like HourglassClassic.jsx. It gets
//      { levels, flowing } and draws glass, sand and any scenery.
//   2. Give it a textSpots(levels) that says where the numbers go inside
//      it, or use text: 'below' to put them under the hourglass instead
//      (for designs where numbers would hide the artwork).
//   3. Add it to the list below. Its id is saved in settings.hourglass.
import HourglassClassic from './HourglassClassic.jsx'
import { textSpots as classicSpots } from './hourglassClassicShape.js'

export const HOURGLASSES = [
  {
    id: 'classic',
    name: 'Classic',
    Component: HourglassClassic,
    // The drawing's size, so numbers can be placed in percent of it.
    width: 200,
    height: 340,
    text: 'inside',
    textSpots: classicSpots,
  },
]

export function hourglassById(id) {
  return HOURGLASSES.find(h => h.id === id) || HOURGLASSES[0]
}
