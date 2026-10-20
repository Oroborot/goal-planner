# App ideas

Ideas for future apps, separate from the Goal Planner. Add new ones at the bottom.

---

## 1. Grocery price tracker (receipt scanner)

**Idea:** scan your receipts; the app notes the price of every product, so you see how prices change over time and know if a price is good or bad.

**Main features**
- **Scan receipts** → every product and its price is saved, with the store and the date.
- **Price history** per product: a chart of how the price changed over time.
- **Alerts** when something is cheaper than usual.
- **Shopping list:** write a list, or reuse an old receipt as a list.
- **Basket total:** see how much your list would cost in a store before you go.
- **Compare stores:** the same list priced at several stores, to find the cheapest.

**End goal:** your groceries mapped out, so you always know whether a price is good or bad, and where to shop.

**Things to find out first (the hard parts)**
- **Reading receipts:** turning a photo into products and prices (OCR). Free options exist for the phone, but receipts use short, messy product names that need matching ("MLK SEMI 1L" = semi-skimmed milk, 1 L).
- **Store prices:** comparing stores needs current prices from each store. Most stores don't offer them openly; options are prices collected from users' receipts (crowdsourced), official store data where it exists, or partners. Collecting prices from store websites automatically can break their terms, so check that before relying on it.
- **Notifications:** real phone alerts need a server (possible cost), same as in the Goal Planner.
- **Privacy:** receipts show where and when someone shops; handle that carefully (see the legal checklist in the Goal Planner's PLAN.md).

**Possible first version:** scan receipts → product price history → "cheaper than usual" badge. Store comparison later.
