import {
  Children,
  cloneElement,
  isValidElement,
  type ReactNode,
  type ReactElement,
} from "react";

type Context = {
  s: any;
  skillSearch: string;
  marketSearch: string;
  openedSkillGroups: Set<string>;
  detailsState: Map<string, boolean>;
  locked: boolean;
  issues: any[];
};
const control = new Set(["input", "select", "textarea", "button"]);
const browseActions = new Set([
  "step",
  "source-info",
  "legacy-info",
  "calculation",
  "career-preview",
  "career-more",
  "books",
]);
function matches(node: ReactElement<any>, selector: string): boolean {
  if (!selector || (typeof node.type !== "string" && !node.props.tag))
    return false;
  const last = selector
    .trim()
    .split(/\s+(?![^\[]*\])/)
    .at(-1)!;
  const id = last.match(/#([\w-]+)/)?.[1];
  if (id && (node as ReactElement<any>).props.id !== id) return false;
  for (const match of last.matchAll(/\.([\w-]+)/g))
    if (
      !String((node as ReactElement<any>).props.className || "")
        .split(" ")
        .includes(match[1])
    )
      return false;
  for (const match of last.matchAll(/\[([\w-]+)(?:=["']?([^"'\]]+)["']?)?\]/g))
    if (
      match[2] === undefined
        ? (node as ReactElement<any>).props[match[1]] === undefined
        : String((node as ReactElement<any>).props[match[1]]) !== match[2]
    )
      return false;
  return !!id || last.includes("[") || last.includes(".");
}
export function decoratePlayerTree(
  root: ReactNode,
  context: Context,
): ReactNode {
  const messages = new Map<string, { text: string[]; targets: string[] }>();
  const invalid = new Map<string, string>();
  const connected = new Set<any>();
  let serial = 0;
  function collect(
    node: ReactNode,
    parents: { node: ReactElement<any>; path: string }[] = [],
    path = "r",
  ) {
    if (!isValidElement<any>(node)) return;
    const chain = [...parents, { node, path }];
    if (
      !chain.some((x) =>
        /(?:^| )(rail|mobile-workspace-bar)(?: |$)/.test(
          x.node.props.className || "",
        ),
      )
    ) {
      for (const issue of context.issues) {
        if (
          connected.has(issue) ||
          issue.severity !== "error" ||
          !matches(node, issue.control?.target)
        )
          continue;
        const container =
          chain.find(
            (x) =>
              x.node.props["data-ui-issue-group"] === issue.code ||
              String(x.node.props.className || "")
                .split(" ")
                .includes("points-grid"),
          ) ??
          [...chain]
            .reverse()
            .find((x) =>
              /(?:^| )(field|gm-entry|gm-char-row|xp-row|skill-row)(?: |$)/.test(
                x.node.props.className || "",
              ),
            ) ??
          parents.at(-1);
        if (!container) continue;
        connected.add(issue);
        const group = messages.get(container.path) ?? { text: [], targets: [] };
        if (!group.text.includes(issue.message)) group.text.push(issue.message);
        group.targets.push(path);
        messages.set(container.path, group);
        invalid.set(path, container.path);
      }
    }
    Children.toArray((node as ReactElement<any>).props.children).forEach(
      (child, i) => collect(child, chain, `${path}.${i}`),
    );
  }
  collect(root);
  const issueIds = new Map(
    [...messages.keys()].map((key) => [key, `ui-issue-${++serial}`]),
  );
  function visit(
    node: ReactNode,
    path = "r",
    locked = false,
    issue?: string,
  ): ReactNode {
    if (!isValidElement<any>(node)) return node;
    const props = { ...(node as ReactElement<any>).props },
      classes = String(props.className || "").split(" ");
    const tag =
      typeof node.type === "string"
        ? node.type
        : (props.tag ?? (props["data-action"] ? "button" : ""));
    const key = props["data-detail-key"];
    if (node.type === "details") {
      if (key && context.detailsState.has(key))
        props.open = context.detailsState.get(key);
      props.className = [...classes, "ui-disclosure"].join(" ");
    }
    if (node.type === "main") {
      props.id = "creator-main";
      props.tabIndex = -1;
    }
    const inLock =
      locked || (context.locked && classes.includes("creation-lock"));
    if (
      inLock &&
      control.has(tag) &&
      props["data-search"] !== "career" &&
      !["careerFilter", "careerBook"].includes(props["data-bind"]) &&
      !browseActions.has(props["data-action"])
    )
      props.disabled = true;
    const ownIssue = issueIds.get(invalid.get(path) || "") || issue;
    if (ownIssue && ["input", "select", "textarea"].includes(tag)) {
      props["aria-invalid"] = true;
      props["aria-describedby"] = [props["aria-describedby"], ownIssue]
        .filter(Boolean)
        .join(" ");
    }
    if (props["data-skill-search"] != null)
      props.hidden =
        !!context.skillSearch &&
        !String(props["data-skill-search"]).includes(
          context.skillSearch.trim().toLocaleLowerCase(),
        );
    if (props["data-market-search"] != null)
      props.hidden =
        !!context.marketSearch &&
        !String(props["data-market-search"]).includes(
          context.marketSearch.trim().toLocaleLowerCase(),
        );
    const children = Children.toArray(props.children).map((child, i) =>
      visit(child, `${path}.${i}`, inLock, ownIssue),
    );
    if (messages.has(path))
      children.push(
        <p
          key="issue"
          id={issueIds.get(path)}
          className="ui-field-issue"
          data-ui-issue=""
        >
          {messages.get(path)!.text.join(" ")}
        </p>,
      );
    if (
      classes.includes("skill-catalog-group") ||
      props["data-market-group"] !== undefined
    ) {
      const rows: ReactElement<any>[] = [];
      function find(items: ReactNode[]) {
        for (const child of items)
          if (isValidElement<any>(child)) {
            if (
              (child as ReactElement<any>).props["data-skill-search"] != null ||
              (child as ReactElement<any>).props["data-market-search"] != null
            )
              rows.push(child);
            find(Children.toArray((child as ReactElement<any>).props.children));
          }
      }
      find(children);
      props.hidden = rows.length > 0 && rows.every((row) => row.props.hidden);
      if (context.skillSearch || context.marketSearch)
        props.open = !props.hidden;
    }
    return cloneElement(node, props, ...children);
  }
  return visit(root);
}
