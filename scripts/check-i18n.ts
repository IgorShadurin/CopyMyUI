import { auditMessages } from "../src/i18n/audit";
import { messagesByLocale } from "../src/i18n/messages";

const findings = auditMessages(messagesByLocale);

if (findings.length === 0) {
  console.log("i18n audit passed: all locales are complete and translated.");
  process.exit(0);
}

console.error(`i18n audit failed with ${findings.length} issue(s):`);

for (const finding of findings) {
  console.error(`- [${finding.locale}] ${finding.path}: ${finding.message}`);
}

process.exit(1);
