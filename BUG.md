# Known Issues

Triage notes from support + QA. Six issues are open against the order service.
Each one is written up the way a customer or a teammate actually reported it.
Reproduce them with the endpoints and tests listed, then fix them.

---

## 1. Platinum customers are being charged the wrong amount

> "I'm a Platinum customer and my discount is smaller than what my Gold colleague gets
> on the same basket. Platinum should be our best rate but it looks like we're getting
> the Gold rate instead."

Reproduce: `POST /api/orders` for `carol@example.com` (Platinum), or
`OrderPricingTest#platinumCustomerReceivesTwentyPercentDiscount`.

---

## 2. Customers can order a negative quantity, and it puts stock *into* the warehouse

> "Support took an order with a quantity of -5 and the API accepted it. Worse, the
> stock level for that product went **up** by five. Same thing happens with a
> quantity of 0 — we accepted the order and shipped nothing."

Reproduce: `POST /api/orders` with any line item where `quantity` is `-5` or `0`, or
`OrderPlacementTest#negativeQuantityIsRejected` / `#zeroQuantityIsRejected`.

---

## 3. Rejected orders are still saved, and stock gets half-taken

> "A customer tried to order 9 monitors when we only had 4. The API correctly told
> them it failed, but when I look at the orders table the order is still sitting
> there, and on the multi-line orders the first product's stock has already been
> decremented even though the whole order was rejected. We have to clean these up
> by hand every day."

Reproduce: `POST /api/orders` requesting more of a product than is in stock,
ideally with two different products on the order, or
`OrderPlacementTest#orderingMoreThanAvailableIsRejectedAndRollsBackCompletely`.

---

## 4. Asking for something that doesn't exist returns HTTP 200

> "Our mobile client treats these as a success because the status code is 200, so
> it renders an empty/error screen instead of a 'not found' message. It happens for
> unknown products, unknown customers and unknown orders. The body does contain an
> error, but the status code is what the client checks."

Reproduce: `GET /api/products/999999`, `GET /api/customers/999999`,
`GET /api/orders/999999`, or any test in `ErrorHandlingTest`.

---

## 5. The customer order history page gets slower the longer a customer has been with us

> "Loading a customer's order history takes several seconds for our long-standing
> accounts. It was fine when they had a handful of orders. It looks like the response
> time grows linearly with the number of orders, and the database is doing a huge
> number of tiny queries while the page loads."

Reproduce: `GET /api/customers/{id}/orders` for a customer with 10+ orders, or
`CustomerOrdersQueryTest`. The test prints the SQL statement count it measured to
stdout, so run it and read the `[perf]` line.

---

## 6. Two customers can buy the same last unit at the same time

> "Two customers both ordered the last headset we had at the same moment and both
> orders went through. We oversold by one. This keeps happening during flash sales.
> Note the support team also flagged the rejected-order problem in issue 3 around
> the same time, so they may be related."

Reproduce: `ConcurrentStockTest`, which races two simultaneous orders against a
product with exactly one unit in stock. You can also see it by hand if you fire
two `POST /api/orders` requests for the last unit simultaneously.

---

## Notes

- The app builds and starts cleanly; these are all runtime behaviour problems, not
  compile errors. `mvn spring-boot:run` then poke at `http://localhost:8080`.
- There is no `README` for the intended behaviour of the endpoints — ask the
  original author, or infer it from the entity model and the failing tests.
- Fixes should keep the currently-passing tests passing. In particular the
  happy-path order, the Gold discount and the Standard no-discount cases are
  believed to be correct already.
