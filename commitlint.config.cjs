// commitlint.config.js
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // 💡 한글/영어 대소문자 섞어 써도 에러 안 나게 subject-case 규칙을 꺼버립니다!
    "subject-case": [0, "never"],
  },
};
