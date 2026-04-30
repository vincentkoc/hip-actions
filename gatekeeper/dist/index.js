/******/ (() => { // webpackBootstrap
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
console.log("Checking policies...");

// console.log("PR context: ");
// console.log(context.payload);
// Loop through policies

// if (context.payload.pull_request != null) {
//   const path = ".argocd.yaml";

//   fs.access(path, fs.F_OK, (err) => {
//     if (err) {
//       const message =
//         "Failed to validate ArgoCD file, please add argocd deployment file to your repository!";
//       const pull_request_number = context.payload.pull_request.number;
//       const octokit = new github.getOctokit(github_token);
//       const new_comment = octokit.issues.createComment({
//         ...context.repo,
//         issue_number: pull_request_number,
//         body: message,
//       });
//       core.setFailed(message);
//       return;
//     }
//   });
// }

module.exports = __webpack_exports__;
/******/ })()
;