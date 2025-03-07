module.exports = {
  extends: ["next/core-web-vitals", "plugin:@typescript-eslint/recommended"],
  rules: {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "@next/next/no-img-element": "warn",
    "import/no-anonymous-default-export": "warn",
    "@typescript-eslint/no-empty-interface": "warn",
    "react-hooks/exhaustive-deps": "warn",
    "@typescript-eslint/ban-ts-comment": "warn",
  },
};
