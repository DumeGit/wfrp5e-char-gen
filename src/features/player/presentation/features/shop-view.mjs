import {
  element,
  fragment,
  attributes,
  joinNodes,
  combine,
  interpolate,
} from "../../../../components/react-elements";
import { detailKey } from "../../../../engine/disclosures.mjs";
import {
  marketCatalog,
  formatMoney,
  purchaseItem,
} from "../../../../engine/market.mjs";
import { sourceLabel } from "../../../../engine/sources.mjs";
import { legacyGear } from "../../../../engine/legacy-character.mjs";
import { shopCategory, purchaseReason } from "../../../../engine/workspace.mjs";

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
    return element(
      "details",
      {
        "data-detail-key": detailKey("shop-view:marketShop:2"),
        class: "shop-disclosure section-gap",
      },
      element("summary", {}, "Shop · buy extra Trappings"),
      element(
        "section",
        { class: "market section-gap" },
        element("h3", {}, "Buy extra equipment ", page("296–316")),
        "\n",
        element(
          "p",
          { class: "small muted" },
          "Creation purchases waive Availability Tests (p. 296). Fixed printed prices and agreed sizing apply. Bought gear earns no creation tracker boxes. Known weight and inherent profile values feed totals; situational effects remain references for play.",
        ),
        "\n",
        element(
          "div",
          { class: "market-balance" },
          element(
            "div",
            {},
            element("span", {}, "Starting funds"),
            element(
              "strong",
              {},
              s.wealth ? formatMoney(wallet.start) : "Not rolled",
            ),
            element("small", {}, "Career cash: ", formatMoney(wallet.grants)),
          ),
          "\n",
          element(
            "div",
            {},
            element("span", {}, "Spent"),
            element("strong", {}, formatMoney(wallet.spent)),
          ),
          "\n",
          element(
            "div",
            {},
            element("span", {}, "Remaining"),
            element("strong", {}, formatMoney(wallet.remaining)),
          ),
          "\n",
        ),
        s.purchases.length
          ? element(
              "details",
              {
                "data-detail-key": detailKey("shop-view:marketShop:0"),
                open: "",
              },
              element("summary", {}, "Purchased items · ", s.purchases.length),
              element(
                "div",
                { class: "market-purchases" },
                joinNodes(
                  s.purchases.map((x, i) => {
                    const item = purchaseItem(R, x);
                    return element(
                      "div",
                      { class: "market-purchase" },
                      element(
                        "span",
                        {},
                        element(
                          "strong",
                          {},
                          esc(item?.name || "Unknown item"),
                        ),
                        element(
                          "small",
                          {},
                          formatMoney(x.pennies ?? item?.pennies),
                          " · ",
                          item ? ref(item) : "Check imported character",
                        ),
                      ),
                      button(
                        "remove-trapping",
                        "Remove",
                        interpolate(
                          ['data-index="', '" aria-label="Remove ', '"'],
                          [i, esc(item?.name || "item")],
                        ),
                      ),
                    );
                  }),
                  "",
                ),
              ),
              "\n",
            )
          : "",
        element(
          "div",
          { class: "browser-filters" },
          element(
            "div",
            { class: "field" },
            element("label", { for: "market-search" }, "Find equipment"),
            element("input", {
              id: "market-search",
              type: "search",
              value: esc(marketSearch),
              placeholder: "Name, category, source or page",
            }),
          ),
          "\n",
          element(
            "div",
            { class: "field" },
            element("label", { for: "shop-group" }, "Category"),
            select(
              'id="shop-group" data-bind="shopGroup"',
              [["all", "All categories"], ...groups],
              shopGroup,
            ),
          ),
          "\n",
          element(
            "div",
            { class: "field" },
            element("label", { for: "shop-book" }, "Source"),
            select(
              'id="shop-book" data-bind="shopBook"',
              [
                ["all", "All selected books"],
                ...R.books
                  .filter((b) => catalog.some((x) => x.source.book === b.id))
                  .map((b) => [b.id, b.shortTitle || b.title]),
              ],
              shopBook,
            ),
          ),
          "\n",
          element(
            "div",
            { class: "field" },
            element("label", { for: "shop-sort" }, "Sort"),
            select(
              'id="shop-sort" data-bind="shopSort"',
              [
                ["name", "Name"],
                ["price-low", "Lowest price"],
                ["price-high", "Highest price"],
              ],
              shopSort,
            ),
          ),
          "\n",
        ),
        "\n",
        element(
          "label",
          { class: "check-row" },
          element("input", {
            type: "checkbox",
            "data-bind": "shopAffordable",
            ...attributes(shopAffordable ? "checked" : ""),
          }),
          "Within my budget and available to buy",
        ),
        element(
          "p",
          { class: "small muted", id: "market-results", "aria-live": "polite" },
          listed.length,
          " equipment profiles",
        ),
        "\n",
        element(
          "div",
          { class: "market-catalog" },
          joinNodes(
            (shopSort === "name"
              ? groups.filter((g) => listed.some((x) => x.browseCategory === g))
              : ["All categories · price order"]
            ).map((category) =>
              element(
                "details",
                {
                  "data-detail-key": detailKey(
                    "shop-view:marketShop:1",
                    category,
                  ),
                  "data-market-group": "",
                  "data-category": esc(category),
                  ...attributes(
                    openedMarketGroups.has(category) ||
                      shopSort !== "name" ||
                      shopGroup !== "all"
                      ? "open"
                      : "",
                  ),
                },
                element(
                  "summary",
                  {},
                  esc(category),
                  " ",
                  element(
                    "span",
                    { class: "minilabel" },
                    listed.filter(
                      (x) =>
                        shopSort !== "name" || x.browseCategory === category,
                    ).length,
                    " items",
                  ),
                ),
                joinNodes(
                  listed
                    .filter(
                      (x) =>
                        shopSort !== "name" || x.browseCategory === category,
                    )
                    .map((x) => {
                      const reason = purchaseReason(R, s, x);
                      return element(
                        "div",
                        {
                          class: "market-item",
                          "data-market-search": esc(
                            interpolate(
                              ["", " ", " ", " ", ""],
                              [
                                x.name,
                                x.category,
                                category,
                                sourceLabel(R, x, { legacy: false }),
                              ],
                            ).toLowerCase(),
                          ),
                        },
                        element(
                          "div",
                          {},
                          x.text
                            ? element(
                                "details",
                                {
                                  class: "market-profile",
                                  "data-detail-key": [
                                    "equipment:",
                                    esc(x.id),
                                  ].join(""),
                                },
                                element(
                                  "summary",
                                  {},
                                  element("strong", {}, esc(x.name)),
                                ),
                                element("p", { class: "small" }, esc(x.text)),
                                "\n",
                              )
                            : element("strong", {}, esc(x.name)),
                          element(
                            "small",
                            {},
                            esc(x.category),
                            " · ",
                            esc(x.availability),
                            " · Enc ",
                            x.enc === null ? "Unknown" : x.enc,
                            " · ",
                            ref({
                              ...x,
                              legacySources: legacyGear(
                                R,
                                s,
                                { key: "shop" },
                                x.name,
                              ).legacySources,
                            }),
                          ),
                          x.sizeNote
                            ? element(
                                "p",
                                { class: "small muted" },
                                esc(x.sizeNote),
                              )
                            : "",
                        ),
                        "\n",
                        element(
                          "div",
                          {},
                          button(
                            "buy-trapping",
                            interpolate(["", " · Buy"], [esc(x.price)]),
                            interpolate(
                              ['data-id="', '" ', ""],
                              [esc(x.id), reason ? "disabled" : ""],
                            ),
                            "primary",
                          ),
                          reason
                            ? element(
                                "p",
                                { class: "purchase-error small" },
                                esc(reason),
                              )
                            : "",
                        ),
                        "\n",
                      );
                    }),
                  "",
                ),
              ),
            ),
            "",
          ),
        ),
        "\n",
      ),
      "\n",
    );
  }

  function filterMarket() {}
  return { marketShop, filterMarket };
}
