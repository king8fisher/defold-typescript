/// <reference path="../index.d.ts" />

declare const client: socket.client;
declare const master: socket.master;
declare const unconnected: socket.unconnected;

socket.select([client], [master, unconnected], 0);

const [readable, writable] = socket.select([client], [master], 0);
const readableSockets: (socket.client | socket.master | socket.unconnected)[] = readable;
const writableSockets: (socket.client | socket.master | socket.unconnected)[] = writable;
void readableSockets;
void writableSockets;

// @ts-expect-error select socket arrays cannot contain arbitrary strings
socket.select(["not-a-socket"], [], 0);
