# React Guidelines — Codebase Comparison

Based on [React Learn](https://react.dev/learn/) documentation. All developers should follow these guidelines.

---

## Guidelines We Follow

| Guideline | Implementation |
|-----------|----------------|
| Component naming | PascalCase for components (e.g., `SideNav`, `ActionDropdown`) |
| `className` in JSX | Use `className` instead of HTML `class` |
| JSX structure | Wrap multiple elements in a parent or fragment `<>` |
| Event handlers | Pass reference: `onClick={handleClick}` (no `()` — React calls it) |
| State | Use `useState`; follow controlled/uncontrolled patterns |
| Props | Pass data down via props; destructure where appropriate |
| Conditional rendering | Use `&&`, `? :`, or `if` as needed |
| Hooks | Call only at top level of components (no conditions/loops) |
| Strict Mode | Use `React.StrictMode` in root |
| Local mutations | OK to mutate variables/arrays created in the same render (e.g., `const arr = []; arr.push(x)`) |

---

## Guidelines to Fix / Improve

### 1. Keep Components Pure — No Side Effects During Render

**Rule:** Components must be pure. No side effects, DOM changes, or global mutations during render.

**Example violation:**

```js
// ❌ BAD — mutates global object during render
function App() {
  const [api, contextHolder] = notification.useNotification();
  notification.success = api.success;
  notification.error = api.error;
  return (...);
}
```

**Correct approach:**

```js
// ✅ GOOD — side effects in useEffect
function App() {
  const [api, contextHolder] = notification.useNotification();
  useEffect(() => {
    notification.success = api.success;
    notification.error = api.error;
    notification.info = api.info;
    notification.warning = api.warning;
  }, [api]);
  return (...);
}
```

---

### 2. Use Stable Keys for Lists

**Rule:** Use stable IDs from data (e.g. `id`, `_id`) as keys, not array index.

**Example violation:**

```js
// ❌ BAD — index changes when list is reordered/filtered
{items.map((item, index) => (
  <Menu.Item key={index} onClick={item.onClick}>
    {item.label}
  </Menu.Item>
))}
```

**Correct approach:**

```js
// ✅ GOOD — stable ID from data
{items.map((item) => (
  <Menu.Item key={item.id} onClick={item.onClick}>
    {item.label}
  </Menu.Item>
))}
```

Use index only when the list is static and never reordered.

---

### 3. Remove Debug Code

**Rule:** Remove `debugger` and other debug-only code before committing.

---

### 4. JSX Syntax

**Rule:** Ensure JSX and event handler syntax is correct; avoid extra/mismatched braces in callbacks.

---

## Reference Links

- [React Learn (Quick Start)](https://react.dev/learn)
- [Keeping Components Pure](https://react.dev/learn/keeping-components-pure)
- [Rendering Lists](https://react.dev/learn/rendering-lists)
- [Thinking in React](https://react.dev/learn/thinking-in-react)
