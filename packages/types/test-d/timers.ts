/// <reference path="../index.d.ts" />

import {
  clearInterval,
  clearTimeout,
  setInterval,
  setTimeout,
  wait,
} from "@defold-typescript/types/timers";

// setTimeout/setInterval return the Defold timer handle (a number) for cancellation.
const _timeout: number = setTimeout(() => {}, 250);
clearTimeout(_timeout);

const _interval: number = setInterval(() => {}, 1000);
clearInterval(_interval);

// wait takes Defold-native seconds and resolves a Promise, so it composes with await.
const _waited: Promise<void> = wait(0.5);
void _waited;

async function demo(): Promise<void> {
  await wait(0.5);
}
void demo;

// @ts-expect-error first argument is a callback, not a string
setTimeout("x", 1);
