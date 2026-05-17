import { Sandbox } from "bvisor";

const sb = new Sandbox();

console.log("=== 1. Hello, world ===\n");
const output = sb.runCmd("echo 'Hello, world!'");
console.log(await output.stdout());

console.log("=== 2. Virtualized filesystem (/tmp/test.txt) ===\n");
sb.runCmd("echo 'Hello, world!' > /tmp/test.txt");
const cat = sb.runCmd("cat /tmp/test.txt");
console.log("inside sandbox:", (await cat.stdout()).trimEnd());

const hostCheck = sb.runCmd(
  "test -f /tmp/test.txt && echo exists || echo missing",
);
console.log(
  "same sandbox still sees file:",
  (await hostCheck.stdout()).trimEnd(),
);

console.log("\n=== 3. Blocked command (chroot) ===\n");
const blocked = sb.runCmd("chroot /tmp");
const blockedStdout = await blocked.stdout();
const blockedStderr = await blocked.stderr();
console.log("stdout:", blockedStdout.trimEnd() || "(empty)");
console.log("stderr:", blockedStderr.trimEnd() || "(empty)");
