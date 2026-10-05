import { detailKey } from "../disclosures.mjs";
import { marketCatalog, formatMoney, purchaseItem } from "../market.mjs";
import { sourceLabel } from "../sources.mjs";
import { legacyGear } from "../legacy-character.mjs";
import { shopCategory, purchaseReason } from "../workspace.mjs";

// Live context keeps rendering state outside the saved character. Unusual book
// mechanics remain explicit handlers rather than generic configuration rules.
export function createFeature(getContext, setContext) {
  function marketShop() {
    let {
      result,
      R,
      s,
      shopSort,
      page,
      esc,
      marketSearch,
      select,
      shopGroup,
      shopBook,
      shopAffordable,
      ref,
      button,
      openedMarketGroups,
    } = getContext();

    const wallet = result().wallet,
      catalog = marketCatalog(R, s).map((x) => ({
        ...x,
        browseCategory: shopCategory(R, x),
      })),
      groups = [...new Set(catalog.map((x) => x.browseCategory))].sort();
    let listed = catalog.filter(
      (x) =>
        (shopBook === "all" || x.source.book === shopBook) &&
        (shopGroup === "all" || x.browseCategory === shopGroup) &&
        (!shopAffordable || !purchaseReason(R, s, x)),
    );
    listed.sort(
      shopSort === "price-low"
        ? (a, b) => a.pennies - b.pennies
        : shopSort === "price-high"
          ? (a, b) => b.pennies - a.pennies
          : (a, b) => a.name.localeCompare(b.name),
    );
    return `<details data-detail-key="${detailKey("shop-view:marketShop:2")}" class="shop-disclosure section-gap"><summary>Shop · buy extra Trappings</summary><section class="market section-gap"><h3>Buy extra equipment ${page("296–316")}</h3>
<p class="small muted">Creation purchases waive Availability Tests (p. 296). Fixed printed prices and agreed sizing apply. Bought gear earns no creation tracker boxes. Known weight and inherent profile values feed totals; situational effects remain references for play.</p>
<div class="market-balance"><div><span>Starting funds</span><strong>${s.wealth ? formatMoney(wallet.start) : "Not rolled"}</strong><small>Career cash: ${formatMoney(wallet.grants)}</small></div>
<div><span>Spent</span><strong>${formatMoney(wallet.spent)}</strong></div>
<div><span>Remaining</span><strong>${formatMoney(wallet.remaining)}</strong></div>
</div>${
      s.purchases.length
        ? `<details data-detail-key="${detailKey("shop-view:marketShop:0")}" open><summary>Purchased items · ${s.purchases.length}</summary><div class="market-purchases">${s.purchases
            .map((x, i) => {
              const item = purchaseItem(R, x);
              return `<div class="market-purchase"><span><strong>${esc(item?.name || "Unknown item")}</strong><small>${formatMoney(x.pennies ?? item?.pennies)} · ${item ? ref(item) : "Check imported character"}</small></span>${button("remove-trapping", "Remove", `data-index="${i}" aria-label="Remove ${esc(item?.name || "item")}"`)}</div>`;
            })
            .join("")}</div>
</details>`
        : ""
    }<div class="browser-filters"><div class="field"><label for="market-search">Find equipment</label><input id="market-search" type="search" value="${esc(marketSearch)}" placeholder="Name, category, source or page"></div>
<div class="field"><label for="shop-group">Category</label>${select('id="shop-group" data-bind="shopGroup"', [["all", "All categories"], ...groups], shopGroup)}</div>
<div class="field"><label for="shop-book">Source</label>${select('id="shop-book" data-bind="shopBook"', [["all", "All selected books"], ...R.books.filter((b) => catalog.some((x) => x.source.book === b.id)).map((b) => [b.id, b.shortTitle || b.title])], shopBook)}</div>
<div class="field"><label for="shop-sort">Sort</label>${select(
      'id="shop-sort" data-bind="shopSort"',
      [
        ["name", "Name"],
        ["price-low", "Lowest price"],
        ["price-high", "Highest price"],
      ],
      shopSort,
    )}</div>
</div>
<label class="check-row"><input type="checkbox" data-bind="shopAffordable" ${shopAffordable ? "checked" : ""}>Within my budget and available to buy</label><p class="small muted" id="market-results" aria-live="polite">${listed.length} equipment profiles</p>
<div class="market-catalog">${(shopSort === "name"
      ? groups.filter((g) => listed.some((x) => x.browseCategory === g))
      : ["All categories · price order"]
    )
      .map(
        (category) =>
          `<details data-detail-key="${detailKey("shop-view:marketShop:1", category)}" data-market-group data-category="${esc(category)}" ${openedMarketGroups.has(category) || shopSort !== "name" || shopGroup !== "all" ? "open" : ""}><summary>${esc(category)} <span class="minilabel">${listed.filter((x) => shopSort !== "name" || x.browseCategory === category).length} items</span></summary>${listed
            .filter((x) => shopSort !== "name" || x.browseCategory === category)
            .map((x) => {
              const reason = purchaseReason(R, s, x);
              return `<div class="market-item" data-market-search="${esc(`${x.name} ${x.category} ${category} ${sourceLabel(R, x, { legacy: false })}`.toLowerCase())}"><div>${
                x.text
                  ? `<details class="market-profile" data-detail-key="equipment:${esc(x.id)}"><summary><strong>${esc(x.name)}</strong></summary><p class="small">${esc(x.text)}</p>
</details>`
                  : `<strong>${esc(x.name)}</strong>`
              }<small>${esc(x.category)} · ${esc(x.availability)} · Enc ${x.enc === null ? "Unknown" : x.enc} · ${ref({ ...x, legacySources: legacyGear(R, s, { key: "shop" }, x.name).legacySources })}</small>${x.sizeNote ? `<p class="small muted">${esc(x.sizeNote)}</p>` : ""}</div>
<div>${button("buy-trapping", `${esc(x.price)} · Buy`, `data-id="${esc(x.id)}" ${reason ? "disabled" : ""}`, "primary")}${reason ? `<p class="purchase-error small">${esc(reason)}</p>` : ""}</div>
</div>`;
            })
            .join("")}</details>`,
      )
      .join("")}</div>
</section>
</details>`;
  }

  function filterMarket() {
    let { marketSearch, $ } = getContext();

    const q = marketSearch.trim().toLowerCase();
    let count = 0;
    for (const group of document.querySelectorAll("[data-market-group]")) {
      let visible = 0;
      for (const row of group.querySelectorAll("[data-market-search]")) {
        row.hidden = !!q && !row.dataset.marketSearch.includes(q);
        if (!row.hidden) visible++;
      }
      group.hidden = visible === 0;
      const countLabel = group.querySelector("summary .minilabel");
      if (countLabel)
        countLabel.textContent = `${visible} item${visible === 1 ? "" : "s"}`;
      if (q && visible) group.open = true;
      count += visible;
    }
    const summary = $("#market-results");
    if (summary) summary.textContent = `${count} matching equipment profiles`;
  }
  return { marketShop, filterMarket };
}
