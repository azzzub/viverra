/* eslint-disable require-jsdoc */
import axios from "axios";
import { format } from "date-fns";

interface TestResult {
  passed: number;
  failed: number;
  ctaURL: string;
  teamMention: string;
  title: string;
  listOfFailedSS: string;
  webhook: string;
  teamName: string;
}

export default async function sendSlack(summary: TestResult) {
  const url = summary.webhook;

  if (!url) throw new Error("no webhook url found");

  let footer = `All good folks! ${summary.teamMention}`;

  if (summary.failed > 0) {
    //     footer = `${summary.teamMention} Failed snapshots:\n${summary.listOfFailedSS}`;
    footer = `There are a diff on some snapshots, please check ${summary.teamMention}`;
  }

  const res = await axios.post(url, {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Visual Testing Viverra Report* ~ _${format(
            new Date(),
            "PPpp"
          )}_\n*${summary.title}*`,
        },
      },
      //       {
      //         type: "section",
      //         text: {
      //           type: "mrkdwn",
      //           text: `*${summary.teamName} • ${summary.title}*`,
      //         },
      //       },
      //       {
      //         type: "divider",
      //       },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*:check_circle: ${summary.passed} SS :warning-red: ${summary.failed} SS*`,
        },
        accessory: {
          type: "button",
          text: {
            type: "plain_text",
            text: ":book: Report",
            emoji: true,
          },
          url: summary.ctaURL,
        },
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: footer,
          },
        ],
      },
    ],
  });

  return res.data;
}
