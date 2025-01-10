export function register(handlebars) {
  handlebars.registerHelper("uppercase", function (str) {
    if (typeof str !== "string") {
      return "";
    }
    return str.toUpperCase();
  });
}
