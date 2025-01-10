export function register(handlebars) {
  handlebars.registerHelper("emphasize", function (options) {
    // Get parameters with defaults
    const color = options.hash.color || "#ffeb3b"; // default yellow
    const style = options.hash.style || "normal"; // normal, bold, italic
    const type = options.hash.type || "background"; // background or text

    // Trim the content to remove extra whitespace
    const content = options.fn(this).trim();

    // Build the style string
    let styles = [];
    if (type === "background") {
      styles.push(`background-color: ${color}`);
      styles.push("padding: 2px 4px");
      styles.push("border-radius: 2px");
    } else {
      styles.push(`color: ${color}`);
    }

    if (style === "bold") styles.push("font-weight: bold");
    if (style === "italic") styles.push("font-style: italic");

    const styleString = styles.join("; ");

    return new handlebars.SafeString(
      `<span style="${styleString}">${content}</span>`
    );
  });
}
