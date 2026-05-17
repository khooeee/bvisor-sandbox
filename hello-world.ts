import { Sandbox } from "bvisor";

const sb = new Sandbox();

console.log("=== 1. Hello, world ===\n");
const output = sb.runCmd("echo 'Hello, world!'");
console.log(await output.stdout());

console.log("=== 2. Virtualized filesystem (/tmp/test.txt) ===\n");
// Avoid `echo … > file` (bvisor 0.0.6 + BusyBox ash).
// For `> path`, ash saves the real stdout on fd 10, dup2s the file onto stdout,
// runs the command, then restores stdout via dup3(10, 1, …). In the sandbox that
// saved fd is EBADF, so restore fails and ash retries forever (dup3/writev loop);
// the shell never exits and awaiting this command's stdout hangs. awk writes via
// its own redirect inside the awk process, which does not hit this path.
const write = sb.runCmd(
  `awk 'BEGIN{print "Hello, world!" > "/tmp/test.txt"}'`,
);
await write.stdout();
await write.stderr();
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
